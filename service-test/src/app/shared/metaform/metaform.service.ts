import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { BusinessRuleService } from '../rule/business-rule.service';
import { Metaform, MfQuestion } from './metaform';

@Injectable()
export class MetaformService {

	// Pass in business rule service
	// TODO(ian) and http service eventually
	constructor(
		private http: Http, 
		private ruleService: BusinessRuleService) { }

	loadForm( name: string ) : Metaform {
		// First, check localStorage, and then check to see whether there's a newer version on the server
		let form;
		let updatedVersionAvailable = false;

		if( localStorage.getItem(`mf:${name}`) ) {
			form =  JSON.parse( localStorage.getItem(`mf:${name}`) );
		}

		// Check version, but only if checkAfter is after now..
		if( form === undefined || form.checkModifiedAfter > Date.now() ) {
			form = this.checkUpdatedFormVersion(name);
		}

		if( form === undefined ) {
			throw new Error(`The form '${name}' was not found on the server!`);
		}

		localStorage.setItem(`mf:${name}`, form);

		return form;
	}

	toFormGroup( form: Metaform ) : FormGroup {
		let group: any = {};
		let questions:MfQuestion<any>[] = form.questions;
		
		questions.forEach(question => {
			group[question.key] = question.required 
				? 
					new FormControl(question.value || '', Validators.required)
				: 
					new FormControl(question.value || '');
		});

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

		return m;
	}

}
