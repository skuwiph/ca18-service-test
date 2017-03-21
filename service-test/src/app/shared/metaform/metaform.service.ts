import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { BusinessRuleService } from '../rule/business-rule.service';
import { IBusinessRuleData } from '../rule/business-rule';
import { Metaform, MetaformSection, MfQuestion, Question, MfTextQuestion } from './metaform';
import { EmailValidator } from './validator/EmailValidator';

@Injectable()
export class MetaformService {

	constructor(
		private http: Http, 
		private ruleService: BusinessRuleService
    ) {}

    /**
     * Is the passed form valid (e.g. complete)?
     * @param form (Metaform) - the form to check
     * @param dataSource (IBusinessRuleData) - data to use for any rule evaluation
     * @returns [boolean, string] - whether the form is valid, and if not a list of the errored items and error reasons
     */
    isValid(form: Metaform, dataSource: IBusinessRuleData) : [boolean, string[]] {
        let errorList: string[] = [];
        let valid = true;

        // NOTE(ian): we early exit in case of falsehood
        for( let i = 0; i < form.questions.length; i++) {
            // Is the question displayable according to the rules?
            let q = form.questions[i];
            let result = this.isQuestionValid(q, dataSource);

            if( !result[0] ) {
                valid = false;
                errorList.concat( result[1] );
            }
        }

        return [valid, errorList];
    }

    /**
     * Is the passed question valid according to its rules
     * @param q (MfQuestion) - the question to check
     * @param dataSource (IBusinessRuleData) - data to use for any rule evaluation
     */
    isQuestionValid(q: MfQuestion, dataSource: IBusinessRuleData) : [boolean, string[]] {
        let isValid = true;
        let errorList: string[] = [];

        if( this.isQuestionDisplayable(q, dataSource) ) {
            // Find the validators for the question
            for( let iq = 0; iq < q.items.length; iq++ ) {
                let item = q.items[iq];
                let itemValue = dataSource.getValue(item.key);

                // console.info(`ItemValue: '${itemValue}'`);

                if( item.required && (!itemValue || itemValue.length == 0) ){
                    errorList.push(`${q.name} is required but is empty`);
                    isValid = false;
                }

                if( item.validators ) {
                    for(let v = 0; v < item.validators.length; v++) {
                        let val = item.validators[v];
                        switch( val ) {
                        case 'Email':
                            {
                                if( !EmailValidator.isValid( itemValue ) ) {
                                    errorList.push(`${q.name} does not have a valid email address.`);
                                    isValid = false;
                                }
                            } 
                            break;
                        default:
                            break;
                        }
                    }
                }
            }
        }

        return [isValid, errorList];
    }

    /**
     * Load a metaform by nane
     * @param name (string) - the name of the form to load from storage or network
     * @returns (Metaform) - the loaded form or null.
     * @throws (Error) - if the JSON parse fails or the form is not found.
     */
	loadForm( name: string ) : Metaform {
		// First, check localStorage, and then check to see whether 
        // there's a newer version on the server
		let form;
		let updatedVersionAvailable = false;

		if( localStorage.getItem(`mf:${name}`) ) {
            try {
			    form =  JSON.parse( localStorage.getItem(`mf:${name}`) );
            } catch (error) {
                throw new Error(`JSON.parse failed: ${error}`);
            }
		}

		// Check version, but only if checkAfter is after now..
        // TODO(ian):TEMP - remove when production ready
		if( true || !form || this.isModified(form) ) {
            // console.log('undefined or ready to check now');
			form = this.checkUpdatedFormVersion(name);
		}

		if( form === undefined ) {
			throw new Error(`The form '${name}' was not found on the server!`);
		}

		localStorage.setItem(`mf:${name}`, JSON.stringify(form));

        // Calculate total number of questions
        form.totalQuestionCount = form.questions.length;

		return form;
	}

    /**
     * Get the next question(s) for display
     * @param form (Metaform) - the form to display
     * @param dataSource (IBusinessRuleData) - data used for display and rules
     * @param defaultDisplay (boolean) - is a mobile view?
     * @param lastQuestionDisplayed (number) - index of the last question previously shown
     * @param isForward (boolean) - are we stepping forwards? Default is TRUE
     */
    public getNextQuestionBlock( 
        form:                   Metaform, 
        dataSource:             IBusinessRuleData, 
        defaultDisplay:         boolean, 
        lastQuestionDisplayed:  number, 
        isForward:              boolean = true 
    )
    : [ MfQuestion[], number, boolean, boolean ]
     {
        let direction = isForward ? +1 : -1;
        let firstValid = isForward ? form.questions.length : -1;
        let lastValid = 0;
        let atStart = false;
        let atEnd = false;

        console.info(`getNextQuestionBlock`);

        // We're on mobile, so we must check the rules ourselves and 
        // only return the one question 
        if( defaultDisplay ) {
            // Find the first applicable question        
            for(let i = lastQuestionDisplayed += direction; i >= 0 && i < form.questions.length; i += direction ) {
                if( this.isQuestionDisplayable( form.questions[i], dataSource ) ) {
                     firstValid = i;
                     lastValid = i + 1;
                     break;
                }
            }

            // What happens if we don't get a valid question -- we are at the
            // end of the form process
            atStart = ( firstValid < 0 );
            atEnd   = ( firstValid == form.questions.length );
                

        // } else {
        //
        // NOTE(ian): Remember that the rules in this case need to be expressed 
        // on the page itself, so we return all questions regardless of any rules
        //
        //     console.log(`Displaying all within the next or previous valid section starting from ${form.questions[lastQuestionDisplayed].caption}`);
        //     let currentSectionId = form.questions[lastQuestionDisplayed].sectionId;
        //     let i = lastQuestionDisplayed;
        //     while( i >= 0 && i <= form.questions.length && currentSectionId == form.questions[i].sectionId ) {
        //         i += direction;
        //     }
        //     if( i < 0 )
        //         atStart = true;
        //     else if( i > form.questions.length)
        //         atEnd = true;
        //     else {
        //         console.log(`first/last question in new section: ${form.questions[i].sectionId}, ${i}`);
        //     }
        }
        let displayedQuestions = [];

        if( !atStart && !atEnd ) {
            displayedQuestions = form.questions.slice(firstValid, lastValid);

            // Ensure data is present
            displayedQuestions.forEach( q => {
                q.items.forEach( mq => {
                    var data = dataSource.getValue( mq.key );
                    mq.value = data;
                })
            });
        }

        return [
            displayedQuestions,
            firstValid,
            atStart,
            atEnd
            ];
    }

    /**
     * Return the current section object for the passed question
     * @param form (Metaform) - the current form
     * @param question (MfQuestion) - the question
     */
    public getSectionForQuestion( form: Metaform, question: MfQuestion ) : MetaformSection {
        let sectionIndex = question.sectionId;
        let section = form.sections.find( s => s.id == sectionIndex );
        return section;
    }

    /**
     * Convert the passed array of questions to an Angular FormGroup
     * @param questionsToDisplay (MfQuestion[]) - the questions to convert to a FormGroup
     * @returns (FormGroup) - the FormGroup for display purposes
     */
    public toFormGroup( questionsToDisplay: MfQuestion[] ) : FormGroup {
		let group: any = {};
		let questions:MfQuestion[] = questionsToDisplay;
		
		questions.forEach(question => {
            question.items.forEach( item => {
                group[item.key] = new FormControl(item.value || '', this.validatorsForQuestion(item));
            });
		});

        console.info(`toFormGroup: ${group.length} items`);

		return new FormGroup(group);
	}

    /**
     * Is the specified question from the array valid for display?
     * @param questions (MfQuestion[]) - array of questions
     * @param dataSource (IBusinessRuleData) - data to check any extant rules against
     */
    private isQuestionDisplayable( question: MfQuestion, dataSource: IBusinessRuleData ) : boolean {
        let valid = false;

        if( question.ruleToMatch !== undefined ) {
            console.debug(`Evaluating rule ${question.ruleToMatch}`);
            valid = this.ruleService.evaluateRule( question.ruleToMatch, dataSource );
        } else {
            // No rules, must be valid
            valid = true;
        }

        return valid;
    }

    /**
     * Load FormGroup validators for the desired question
     * @param item (Question) - the question to load validators for
     */
    private validatorsForQuestion( item: Question<any> ) : any {
        let vals: any[] = [];

        if( item.required ) {
            vals.push(Validators.required);
        }

        if( item.validators !== undefined ) {
            //console.info(`Loading validators for control`);
            item.validators.forEach( v => {
                //console.info(`Validator is ${v}`);
                switch( v ) {
                    case 'Email':
                        vals.push( EmailValidator.isValidMailFormat )
                        break;
                    default:
                        break;
                }
            });
        }

        if( vals.length == 0 )
            return '';
        else
            return vals;
    }
   
	// TODO(ian): Determine whether we need to separate out these calls
	// If it's just as quick to read the entire form JSON and pipe it back,
	// then we can do that. If it's noticeably faster just to get the Header ETAG
	// value and check that, that's what we should do.
	private checkUpdatedFormVersion( name: string ) : Metaform {
		let m = new Metaform();

        console.debug(`returning test_form`);

        m = this.test_form;

		return m;
	}

    /**
     * Is the form we have modified?
     * @param form (Metaform) 
     */
    private isModified(form: Metaform) : boolean {
        let checkAfter: number = form.checkModifiedAfterTicks * 10000;
        let now: number = new Date(Date.now()).getTime() * 10000;

        return checkAfter > now;
    }

    // TEST DATA
    private test_form: Metaform = { 
        checkModifiedAfterTicks: new Date(Date.now()-1000).getTime(), 
        lastModifiedTicks: new Date(Date.now()).getTime(),
        name: 'Preparing for interview', 
        totalQuestionCount: 0, 
        version: 1,
        sections: [
            {
                id: 1,
                title: 'About you',
            },
            {
                id: 2,
                title: 'About your Lungfish',
            }
        ],
        questions: [
            {
                sectionId: 1,
                caption: 'This is a question caption for the attached questions',
                name: 'Meaningless?',
                items: [
                    { 
                        controlType: 'textbox', 
                        label: 'First name', 
                        key: 'firstName', 
                        value: "",
                        required: true 
                    },
                    { 
                        controlType: 'textbox', 
                        label: 'Last name', 
                        key: 'lastName', 
                        value: "",
                        required: true 
                    }
                ]
            },                    
            {
                sectionId: 1,
                caption: 'Another caption for the email question',
                name: 'email',
                items: [
                    { 
                        controlType: 'email', 
                        label: 'Email', 
                        key: 'email', 
                        value: "",
                        required: true,
                        validators: ['Email']
                    }
                ]
            },
            {
                sectionId: 1,
                caption: '',
                name: 'options',
                items: [
                    { 
                        controlType: 'optionselect', 
                        label: 'Are you ready to be heartbroken?', 
                        key: 'heartbroken', 
                        value: "",
                        options: [
                            { code: 'Y', description: 'Yes, Lloyd, I\'m ready to be heartbroken'},
                            { code: 'N', description: 'Why no, no I\'m not, actually'},
                            { code: 'M', description: 'A third option which doesn\'t make any sense'}
                        ],
                        required: true
                    }
                ]
            },
            {
                sectionId: 1,
                caption: 'Why on earth are you ready to be heartbroken?',
                name: 'explainHeartbroken',
                ruleToMatch: 'ReadyToBeHeartbroken',
                items: [
                    { 
                        controlType: 'multiline', 
                        label: '', 
                        key: 'explainHeartbroken', 
                        value: "",
                        required: true 
                    }
                ]
            },            
            {
                sectionId: 2,
                caption: 'Here\'s the first question from the second section',
                name: 'fishTelephone',
                items: [
                    { 
                        controlType: 'dropdown', 
                        label: 'Country Code', 
                        key: 'iddCode', 
                        value: "",
                        required: true ,
                        options: [
                            { code: '44', description: 'United Kingdom'},
                            { code: '1', description: 'United States'}
                        ],                        
                    },
                    { 
                        controlType: 'textbox', 
                        label: 'Number', 
                        key: 'telephoneNumber', 
                        value: "",
                        required: true 
                    }
                ]
            },                    
            {
                sectionId: 2,
                caption: 'A last question from section #2',
                name: 'options',
                items: [
                    { 
                        controlType: 'optionselect', 
                        label: 'Colour', 
                        key: 'fishColour', 
                        value: "",
                        required: true,
                        options: [
                            { code: 'R', description: 'Red'},
                            { code: 'G', description: 'Green'},
                            { code: 'B', description: 'Blue'}
                        ],
                    }
                ]
            }           
        ]
    };
}

