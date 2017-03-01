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
import { Metaform, MfQuestion, Question, MfTextQuestion } from './metaform';

@Injectable()
export class MetaformService {

	constructor(
		private http: Http, 
		private ruleService: BusinessRuleService
    ) {}

	loadForm( name: string ) : Metaform {
		// First, check localStorage, and then check to see whether there's a newer version on the server
		let form;
		let updatedVersionAvailable = false;

        console.log(`loadForm '${name}'`);

		if( localStorage.getItem(`mf:${name}`) ) {
			console.log("localStorage has the form");
			form =  JSON.parse( localStorage.getItem(`mf:${name}`) );
			console.log(`Form is ${form.name}, check after ${form.checkModifiedAfter}`);
		}

		// Check version, but only if checkAfter is after now..
		if( form === undefined || form.checkModifiedAfter > Date.now() ) {
			console.log("Find updated form");
			form = this.checkUpdatedFormVersion(name);
		}

		if( form === undefined ) {
			throw new Error(`The form '${name}' was not found on the server!`);
		}

		localStorage.setItem(`mf:${name}`, JSON.stringify(form));

		return form;
	}

	// Insert data into each question control
	loadFormData( form: Metaform, dataSource: IBusinessRuleData ) {
		// Probably not the best implementation
		for(let q of form.questions) {
			for(let mq of q.items) {
				var data = dataSource.getValue( mq.key );
				mq.value = data;
			}
		}
	}

	toFormGroup( form: Metaform ) : FormGroup {
        if( form === undefined ) {
            throw new Error(`The form was not loaded prior to calling this method!`);
        }

		let group: any = {};
		let questions:MfQuestion[] = form.questions;
		
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



	// TODO(ian): Determine whether we need to separate out these calls
	// If it's just as quick to read the entire form JSON and pipe it back,
	// then we can do that. If it's noticeably faster just to get the Header ETAG
	// value and check that, that's what we should do.
	private checkUpdatedFormVersion( name: string ) : Metaform {
		let m = new Metaform();

		m.name = name;
		m.version = 1;
		m.lastModified = new Date( Date.now() );
		m.checkModifiedAfter = new Date( Date.now() + 10000 );

		let items: Question<any>[] = [];

		let fn = new MfTextQuestion( { key: "firstName", label: "First name", required: true} );
		let ln = new MfTextQuestion( { key: "lastName", label: "Last name", required: true} );
		items.push(fn);
		items.push(ln);

		let q1 = new MfQuestion("FullName", items, "Please enter your full name")
		m.questions.push(q1);

		return m;
	}

}
