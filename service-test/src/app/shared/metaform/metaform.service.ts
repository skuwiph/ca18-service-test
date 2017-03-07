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

	loadForm( name: string ) : Metaform {
		// First, check localStorage, and then check to see whether 
        // there's a newer version on the server
		let form;
		let updatedVersionAvailable = false;

		if( localStorage.getItem(`mf:${name}`) ) {
            try {
			    form =  JSON.parse( localStorage.getItem(`mf:${name}`) );
			    console.debug(`Form is ${form.name}, check after ${form.checkModifiedAfter}`);
            } catch (error) {
                console.error(`JSON.parse failed: ${error}`);
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

	// Insert data into each question control
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


    whatToRender( 
        form: Metaform, 
        section: MetaformSection, 
        dataSource: IBusinessRuleData, 
        firstQuestionToDisplay: number, 
        isMobile: boolean,
        direction: number = +1
    ) 
    : [MetaformSection, number, MfQuestion[], FormGroup, boolean] {
        let currentSection = section;
        let q: MfQuestion[] = [];
        let fg: FormGroup;
        let sectionIndex: number;
        let atEndOfForm = false;

        if( direction < 0 ) firstQuestionToDisplay -= 2;

        let lastQuestionToDisplay = firstQuestionToDisplay + 1;

        // console.log(`first, last: ${firstQuestionToDisplay}, ${lastQuestionToDisplay}`);

        // Are we stepping beyond our limit?
        if( currentSection == null 
        || ( (firstQuestionToDisplay >= currentSection.questions.length && direction > 0)
        || ( firstQuestionToDisplay <= 0 && direction < 0 ) )  ) {
            // Get the next available section
            currentSection = this.findNextAvailableSection(form, currentSection, dataSource, direction);

            if( direction > 0 ) {
                firstQuestionToDisplay = 0;
            } else {
                if( isMobile ) {
                    firstQuestionToDisplay = currentSection.questions.length - 1;
                } else {
                    firstQuestionToDisplay = 0;
                }
            }
            lastQuestionToDisplay = firstQuestionToDisplay + 1;
        }

        // Get the section index so we know when we're on the last one
        sectionIndex = this.findSectionIndex(form, currentSection);

        // If we are NOT mobile, we return all questions in the desired section.
        // If we ARE mobile, we return the 'current' question from the 'current' section.
        if( !isMobile ) {
            lastQuestionToDisplay = currentSection.questions.length;
        }

        //console.info(`Got section: ${currentSection.title}, sectionCount = ${form.sections.length}, index = ${sectionIndex}, first = ${firstQuestionToDisplay}, last = ${lastQuestionToDisplay}, count = ${currentSection.questions.length}`);

        q = currentSection.questions.slice(firstQuestionToDisplay, lastQuestionToDisplay);
        fg = this.toFormGroup(q);

        atEndOfForm = sectionIndex == form.sections.length - 1 && lastQuestionToDisplay == currentSection.questions.length - 1;

        return [currentSection, lastQuestionToDisplay, q, fg, atEndOfForm];
    }

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
        console.info(`Direction: ${direction}`);

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

        // console.info(`direction: ${direction}, startIndex: ${startIndex}`);

        // Skip through to find the matching section
        for(let i = startIndex; i < form.sections.length; i += direction ) {
            // console.debug(`> Index is ${i}`);
            if( this.isSectionValid( form.sections[i], dataSource )) {
                // console.info(`> Got section with index ${i}`);
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
