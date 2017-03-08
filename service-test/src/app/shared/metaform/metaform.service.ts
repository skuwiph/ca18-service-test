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
		if( form === undefined || form.checkModifiedAfter > Date.now() ) {
			form = this.checkUpdatedFormVersion(name);
		}

		if( form === undefined ) {
			throw new Error(`The form '${name}' was not found on the server!`);
		}

		localStorage.setItem(`mf:${name}`, JSON.stringify(form));

        // Calculate total number of questions
        let count: number = 0;
        for( let s of form.sections ) {
            count += s.questions.length;
        }

        form.totalQuestionCount = count;

		return form;
	}

	/**
     * Insert data into each question control
     * @param form (Metaform) - the metaform to populate
     * @param dataSource (IBusinessRuleData) an object containing the data to load
     */
	loadFormData( form: Metaform, dataSource: IBusinessRuleData ) : void {
		// Probably not the best implementation
        for(let s of form.sections) {
            for(let q of s.questions) {
                for(let mq of q.items) {
                    var data = dataSource.getValue( mq.key );
                    mq.value = data;
                }
            }
        }
	}

    /**
     * Discover what to render in the display component
     * @param form - the loaded form itself
     * @param section - the current section (if null, assume first section in form)
     * @param dataSource - where to find data for any business rule checking
     * @param startQuestion - which question to start display from (send returned value at index 1)
     * @param isMobile - are we displaying on a small screen
     * @param direction - are we moving forwards (+1) or backwards (-1) through the form
     * 
     * @returns ([the new current section, the first question displayed, the question array, the generated form group array, whether we are at the end of the question array, the current question count for progress checking])
     */
    whatToRender( 
        form: Metaform, 
        section: MetaformSection, 
        dataSource: IBusinessRuleData, 
        startQuestion: number, 
        isMobile: boolean,
        direction: number = +1
    ) 
    : [MetaformSection, number, MfQuestion[], FormGroup, boolean, boolean, number] {
        let currentSection = section;
        let q: MfQuestion[] = [];
        let fg: FormGroup;
        let sectionIndex: number;
        let atEndOfForm = false;
        let atStartOfForm = false;
        let currentQuestion = 0;

        if( direction < 0 ) startQuestion -= 2;
        let endQuestion = startQuestion + 1;

        // NOTE(ian): I appreciate there is redundancy in the next couple of 
        // blocks, but for readability's sake I'm happy to be less particular

        // If we don't have a question, grab the first applicable one
        if( currentSection == null )
            currentSection = this.findNextAvailableSection(form, currentSection, dataSource, direction);    

        // Depending on direction, are we changing the section?
        if( direction < 0 ) {
            // console.log("going back");
            if( startQuestion < 0 ) {
                // console.info(`firstQuestion ${startQuestion}`);
                currentSection = this.findNextAvailableSection(form, currentSection, dataSource, direction);    
                startQuestion = currentSection.questions.length - 1;
            }
        } else {
            if( startQuestion >= currentSection.questions.length ) {
                currentSection = this.findNextAvailableSection(form, currentSection, dataSource, direction);    
                startQuestion = 0;
            }
        }
        endQuestion = startQuestion + 1;

        // Get the section index so we know when we're on the last one
        sectionIndex = this.findSectionIndex(form, currentSection);

        // If we are NOT mobile, we return all questions in the desired section.
        // If we ARE mobile, we return the 'current' question from the 'current' section.
        if( !isMobile ) {
            endQuestion = currentSection.questions.length;
        }

        //console.info(`Got section: ${currentSection.title}, sectionCount = ${form.sections.length}, index = ${sectionIndex}, first = ${startQuestion}, last = ${endQuestion}, count = ${currentSection.questions.length}`);

        q = currentSection.questions.slice(startQuestion, endQuestion);
        fg = this.toFormGroup(q);
        currentQuestion = this.currentQuestionCount(form, sectionIndex, startQuestion);

        atStartOfForm = currentQuestion == 0;
        atEndOfForm = sectionIndex == form.sections.length - 1 && endQuestion == currentSection.questions.length;

        return [currentSection, endQuestion, q, fg, atStartOfForm, atEndOfForm, currentQuestion];
    }

    private currentQuestionCount(form: Metaform, currentSectionIndex: number, startQuestion: number ) : number {
        let acc = 0;

        for( let i = 0; i < currentSectionIndex; i++) {
            acc += form.sections[i].questions.length;
        }

        return acc + startQuestion;
    }

    /**
     * Convert the passed array of questions to an Angular FormGroup
     * @param questionsToDisplay (MfQuestion[]) - the questions to convert to a FormGroup
     * @returns (FormGroup) - the FormGroup for display purposes
     */
    private toFormGroup( questionsToDisplay: MfQuestion[] ) : FormGroup {
		let group: any = {};
		let questions:MfQuestion[] = questionsToDisplay;
		
		questions.forEach(question => {
            question.items.forEach( item => {
                group[item.key] = item.required 
                    ? 
                        new FormControl(item.value || '', Validators.required)
                    : 
                        new FormControl(item.value || '');
            });
		});

		return new FormGroup(group);
	}

    private findNextAvailableSection(form: Metaform, startSection: MetaformSection, dataSource: IBusinessRuleData, direction: number = +1 ) : MetaformSection {
        let matchingSection: MetaformSection;
        let startIndex = 0;

        if( startSection ) {
            form.sections.forEach( (section, index) => {
                if( section == startSection ) {
                    startIndex = index + direction;
                    
                    if( startIndex < 0 ) startIndex = 0;
                }
            } );
        }

        // Skip through to find the matching section
        for(let i = startIndex; i < form.sections.length; i += direction ) {
            if( this.isSectionValid( form.sections[i], dataSource )) {
                matchingSection = form.sections[i];
                break;
            }
        }

        if( !matchingSection )
            throw new Error("No matchingSection!");

        return matchingSection;
    }

    private findSectionIndex(form: Metaform, currentSection: MetaformSection ) : number {
        let sectionIndex = 0;

        form.sections.forEach( (section, index) => {
            if( section == currentSection ) {
                sectionIndex = index;
            }
        } );

        return sectionIndex;
    }

    private isSectionValid( section: MetaformSection, dataSource: IBusinessRuleData ) : boolean {
        let hasRules = (section.ruleToMatch !== undefined);

        // if( hasRules ) {
        //     console.debug(`s.ruleToMatch = ${section.ruleToMatch}`);
        // }

        // If this section has a rule and it evaluates true, OR we do not have a rule,
        // that's our next section
            if( (hasRules && this.ruleService.evaluateRule(section.ruleToMatch, dataSource) ) 
            || !hasRules ) {
                console.log(`--> Matching section is ${section.title}`);
                return true;
        }

        return false;
    }

	// TODO(ian): Determine whether we need to separate out these calls
	// If it's just as quick to read the entire form JSON and pipe it back,
	// then we can do that. If it's noticeably faster just to get the Header ETAG
	// value and check that, that's what we should do.
	private checkUpdatedFormVersion( name: string ) : Metaform {
		let m = new Metaform();

		// m.name = name;
		// m.version = 1;
		// m.lastModified = new Date( Date.now() );
		// m.checkModifiedAfter = new Date( Date.now() + 10000 );

		// let items: Question<any>[] = [];

		// let fn = new MfTextQuestion( { key: "firstName", label: "First name", required: true} );
		// let ln = new MfTextQuestion( { key: "lastName", label: "Last name", required: true} );
		// items.push(fn);
		// items.push(ln);

		// let q1 = new MfQuestion("FullName", items, "Please enter your full name")
		// // m.questions.push(q1);

        console.debug(`returning test_form`);

        m = this.test_form;

		return m;
	}

    private test_form: Metaform = { 
        checkModifiedAfter: new Date( Date.now() + 10000 ), 
        lastModified: new Date( Date.now() ), 
        name: 'A Simple Form', 
        totalQuestionCount: 0, 
        version: 1,
        sections: [
            {
                title: 'About you',
                questions: [
                    {
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
                        caption: 'Another caption for the email question',
                        name: 'email',
                        items: [
                            { 
                                controlType: 'textbox', 
                                label: 'Email', 
                                key: 'email', 
                                order: 1,
                                value: "",
                                required: true 
                            }
                        ]
                    },
                    {
                        caption: '',
                        name: 'options',
                        items: [
                            { 
                                controlType: 'optionselect', 
                                label: 'someopt', 
                                key: 'someopt', 
                                order: 1,
                                value: "",
                                options: [
                                    { code: 'Y', description: 'Yes, Lloyd, I\'m ready to be heartbroken'},
                                    { code: 'N', description: '\'cause I can\'t see further than my feet at this moment'}
                                ],
                                required: true 
                            }
                        ]
                    }                                         
                ]
            },
            {
                title: 'About your Lungfish',
                questions: [
                    {
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
            }            
        ]
    };
}
