import { Injectable } from '@angular/core';
import { Router,ActivatedRoute  } from '@angular/router';

import { Http } from '@angular/http';

import { BusinessRuleService } from '../rule/business-rule.service';
import { IBusinessRuleData, BusinessRule } from '../rule/business-rule';

import { MetaformService } from '../metaform/metaform.service';

import { ApplicationSequence, TrackerSequence, TrackerSequenceType, SequenceStep } from './tracker-sequence';

@Injectable()
export class TrackerService {

    constructor(
        private http: Http,
        private ruleService: BusinessRuleService,
        private formService: MetaformService
    ) { 

    }


    // NOTE(ian): return sequence for application
    // NOTE(ian): should be stored in localStorage
    loadSequenceForApplication(applicationId: number, forceRead?: boolean) : ApplicationSequence {
        // console.log(`Read sequence for application ${applicationId}`);

        let seq = this.getSequenceFromStorage();
        if( seq === null || forceRead ) {
            seq = this.sequence;

            // Write to localStorage
            localStorage.setItem("Seq", JSON.stringify(seq));
        }

        return seq;
    }

    // NOTE(ian): Given we have a set of sequences, which one should
    // we display next?
    findFirstMatchingSequence( applicationSequence: ApplicationSequence, rules: BusinessRule[], data: IBusinessRuleData ) : TrackerSequence {
        //let seq = this.getSequenceFromStorage();
        let matchingSequence: TrackerSequence;
        if( applicationSequence === null || applicationSequence.sequence === null ) {
            return null;
        }

        this.ruleService.setRules(rules);
        let overrideSequence = 0;

        // There may be a priority override!
        if( applicationSequence.prioritySequenceId.length > 0) {
            overrideSequence = applicationSequence.prioritySequenceId[0];
        }

        for(let s of applicationSequence.sequence ) {
            // TODO(ian): We may still need to check that any rule still applies
            // in case the user has updated something since we received the priority override
            if( s.id == overrideSequence && !s.complete )  {
                matchingSequence = s;
                break;
            }

            if( overrideSequence == 0 && !s.complete ) {
                if( s.ruleToMatch !== undefined ) {
                    if( this.ruleService.evaluateRule( s.ruleToMatch, data) ) {
                        matchingSequence = s;
                        break;
                    }
                } else {
                    matchingSequence = s;
                    break;
                }
            }
        }

        return matchingSequence;
    }

    // Find first incomplete step
    findFirstMatchingStep( sequence: TrackerSequence, rules: BusinessRule[], data: IBusinessRuleData ) : SequenceStep {
        let matchingStep: SequenceStep;
        if( sequence.steps ) {
            this.ruleService.setRules(rules);
            for(let step of sequence.steps) {
                if( !step.complete) {
                    matchingStep = step;
                    break;
                }
            }
        }

        return matchingStep;
    }

    navigateToStep( sequence: TrackerSequence, step: SequenceStep, router: Router ) : void {
        router.navigate( step.routerUrl );
    }

    markSequenceComplete( applicationSequence: ApplicationSequence, sequence: TrackerSequence ) {
        // Mark as completed
        sequence.complete = true;

        // Just in case
        for( let step of sequence.steps ) {
            step.complete = true;
        }

        // Check for existence in priority sequence; should always be element #0
        if( applicationSequence.prioritySequenceId[0] == sequence.id )
            applicationSequence.prioritySequenceId.shift();
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

    private sequence: ApplicationSequence = {sequence: [
        {id: 1, complete: true, title: 'A completed sequence item', type: TrackerSequenceType.Custom, steps: []},
        {id: 2, complete: false, title: 'An incomplete sequence item', type: TrackerSequenceType.Custom, ruleToMatch:'Test String Rule', 
            steps: [
                { id: 100, complete: false, routerUrl: ['sequence/page', 1]}
            ]
        },
        {id: 3, complete: false, title: 'A second incomplete sequence item', type: TrackerSequenceType.Custom, ruleToMatch: 'Date Equality Rule', 
            steps: [
                { id: 300, complete: false, routerUrl: ['sequence/page/1']}
            ]
        }
    ], prioritySequenceId: []};
}
