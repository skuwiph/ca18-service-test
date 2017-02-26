import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { BusinessRuleService } from '../rule/business-rule.service';
import { Metaform } from './metaform';

@Injectable()
export class MetaformService {

	// Pass in business rule service
	// TODO(ian) and http service eventually
	constructor(
		private http: Http, 
		private ruleService: BusinessRuleService) { }

	loadForm( name: string ) {
		// First, check localStorage, and then check to see whether there's a newer version on the server

	}

}
