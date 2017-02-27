import { Injectable } from '@angular/core';

import { Http } from '@angular/http';

import { BusinessRuleService } from '../rule/business-rule.service';
import { IBusinessRuleData } from '../rule/business-rule';

import { MetaformService } from '../metaform/metaform.service';

import { ApplicationSequence, TrackerSequence, SequenceStep } from './tracker-sequence';

@Injectable()
export class TrackerService {

    constructor(
        private http: Http,
        private ruleService: BusinessRuleService,
        private formService: MetaformService
        ) { 

        }

    navigateToStep( sequence: TrackerSequence, step: SequenceStep ) {
        // TODO(ian): Add router information in too
    }

    // NOTE(ian): Given we have a set of sequences, which one should
    // we display next?
    findFirstMatchingSequence( data: IBusinessRuleData ) : TrackerSequence {
        let seq = this.getSequenceFromStorage();
        let matchingSequence: TrackerSequence;
        if( seq === undefined ) {
        } else {
            for(let s of seq.sequence ) {
                if( !s.complete ) {
                    if( s.ruleToMatch !== undefined && this.ruleService.evaluateRule( s.ruleToMatch, data) ) {
                        matchingSequence = s;
                        break;
                    }
                }
            }
        }

        return matchingSequence;
    }

    // NOTE(ian): return sequence for application
    // NOTE(ian): should be stored in localStorage
    loadSequence(applicationId: number) : void {
        console.log(`Read sequence for application ${applicationId}`);

        let seq = this.getSequenceFromStorage();
        if( seq === undefined ) {
            // read from http and wait for response

            // Write to localStorage
        }

    }

    private getSequenceFromStorage() : ApplicationSequence {
        let seq = new ApplicationSequence();

        // TODO(ian): localStorage 
        if( localStorage.getItem("Seq") === undefined ) {
            console.log("No sequence stored");
        }

        seq = JSON.parse(localStorage.getItem("Seq"));

        return seq;
    }

}
