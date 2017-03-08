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

@Injectable()
export class MetaformService {

	constructor(
		private http: Http, 
		private ruleService: BusinessRuleService
    ) {}

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
        console.log(`Checking form modified`);
		if( form === undefined || this.isModified(form) ) {
            console.log('undefined or ready to check now');
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

        console.info(`getNextQuestionBlock: first = ${firstValid}, lastDisplayed = ${lastQuestionDisplayed}`);

        // We're on mobile, so we must check the rules ourselves and 
        // only return the one question 
        if( defaultDisplay ) {
            console.log(`Starting at ${lastQuestionDisplayed}`);

            // Find the first applicable question        
            for(let i = lastQuestionDisplayed += direction; i >= 0 && i < form.questions.length; i += direction ) {
                console.info(`Finding question at ${i}`);
                if( this.isValidQuestion( form.questions, i, dataSource ) ) {
                    console.debug(`Got a valid question: ${i}, ${form.questions[i].caption}`);
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

    private isValidQuestion( questions: MfQuestion[], index: number, dataSource: IBusinessRuleData ) : boolean {
        let valid = false;

        if( questions[index].ruleToMatch !== undefined ) {
            console.debug(`Evaluating rule ${questions[index].ruleToMatch}`);
            valid = this.ruleService.evaluateRule( questions[index].ruleToMatch, dataSource );
        } else {
            // No rules, must be valid
            valid = true;
        }

        return valid;
    }

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

		return new FormGroup(group);
	}

    private validatorsForQuestion( item: Question<any> ) : any {
        let vals: any[] = [];

        if( item.required ) {
            vals.push(Validators.required);
        }

        if( item.validators !== undefined ) {
            console.info(`Loading validators for control`);
            item.validators.forEach( v => {
                console.info(`Validator is ${v}`);
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

    private isModified(form: Metaform) : boolean {
        let checkAfter: number = form.checkModifiedAfterTicks * 10000;
        let now: number = new Date(Date.now()).getTime() * 10000;

        return checkAfter > now;
    }

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
                        order: 1,
                        value: "",
                        required: true 
                    },
                    { 
                        controlType: 'textbox', 
                        label: 'Last name', 
                        key: 'lastName', 
                        order: 2,
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
                        order: 1,
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
                        key: 'heartbreak', 
                        order: 1,
                        value: "",
                        options: [
                            { code: 'Y', description: 'Yes, Lloyd, I\'m ready to be heartbroken'},
                            { code: 'N', description: '\'cause I can\'t see further than my feet at this moment'}
                        ],
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
                        order: 1,
                        value: "",
                        required: true 
                    },
                    { 
                        controlType: 'textbox', 
                        label: 'Number', 
                        key: 'telephoneNumber', 
                        order: 2,
                        value: "",
                        required: true 
                    }
                ]
            },                    
            {
                sectionId: 2,
                caption: 'A last question from section #2',
                name: 'fishColour',
                items: [
                    { 
                        controlType: 'options', 
                        label: 'Colour', 
                        key: 'fishColour', 
                        order: 1,
                        value: "",
                        required: true 
                    }
                ]
            }                    
        ]
    };
}

export class EmailValidator {

   static isValidMailFormat(control: FormControl){
        let EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

        if (control.value != "" && (control.value.length <= 5 || !EMAIL_REGEXP.test(control.value))) {
            return { "Please provide a valid email": true };
        }

        return null;
    }

}

