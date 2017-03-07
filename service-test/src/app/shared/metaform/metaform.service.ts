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

	toFormGroup( form: Metaform, section: MetaformSection ) : FormGroup {
        if( form === undefined ) {
            throw new Error(`The form was not loaded prior to calling this method!`);
        }

		let group: any = {};
		let questions:MfQuestion[] = section.questions;
		
		// Depending on whether we're desktop or not indicates
		// whether we are displaying only one question, or all
		// questions in a 'section'
		
		// questions.forEach(question => {
		// 	group[question.key] = question.required 
		// 		? 
		// 			new FormControl(question.value || '', Validators.required)
		// 		: 
		// 			new FormControl(question.value || '');
		// });

		return new FormGroup(group);
	}

    whatToRender( form: Metaform, section: MetaformSection, isMobile: boolean ) : [MfQuestion[], FormGroup] {
        let q: MfQuestion[] = [];
        let fg: FormGroup;

        // If we are NOT mobile, we return all questions in the desired section.
        

        // If we ARE mobile, we return the 'current' question from the 'current' section.


        return [q, fg];
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
                    }                    
                ]
            }
        ]
    };
}
