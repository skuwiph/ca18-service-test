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

    navigateToStep( sequence: TrackerSequence, step: SequenceStep, router: Router ) : void {
        // TODO(ian): Add router information in too
        // console.log(`navigateToStep: routerUrl is ${step.routerUrl}`);
        router.navigate( step.routerUrl );
    }

    // NOTE(ian): Given we have a set of sequences, which one should
    // we display next?
    findFirstMatchingSequence( applicationSequence: ApplicationSequence, rules: BusinessRule[], data: IBusinessRuleData ) : TrackerSequence {
        //let seq = this.getSequenceFromStorage();
        let matchingSequence: TrackerSequence;
        if( applicationSequence === null || applicationSequence.sequence === null ) {
                // console.error(`ApplicationSequence.sequence is null!`);
                return null;
        }

        this.ruleService.setRules(rules);

        for(let s of applicationSequence.sequence ) {
            if( !s.complete ) {
                // console.log(`Sequence ${s.id} is not complete`);
                // console.log(`Rule: "${s.ruleToMatch}"`);

                if( s.ruleToMatch !== undefined ) {
                    // console.log(`We have rule "${s.ruleToMatch}" to match...`);

                    if( this.ruleService.evaluateRule( s.ruleToMatch, data) ) {
                        // console.log(`Rule "${s.ruleToMatch}" did!`);
                        matchingSequence = s;
                        break;
                    // } else {
                    //     console.log(`Rule "${s.ruleToMatch}" did not match, finding next!`);
                    }
                } else {
                    // console.log("We don't have a rule to match so we're taking this one");
                    matchingSequence = s;
                    break;
                }
            // } else {
            //     console.log(`Sequence ${s.id} is complete already`);
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
                    // console.log(`Step ${step.id} is not complete`);
                    matchingStep = step;
                    break;
                }
            }
        }

        return matchingStep;
    }


    // NOTE(ian): return sequence for application
    // NOTE(ian): should be stored in localStorage
    loadSequenceForApplication(applicationId: number, forceRead?: boolean) : ApplicationSequence {
        // console.log(`Read sequence for application ${applicationId}`);

        let seq = this.getSequenceFromStorage();
        if( seq === null || forceRead ) {
            // if( forceRead )
            //     console.log("Force a refresh of sequence");
            // else
            //     console.log("Sequence is not in local storage");

            // read from http and wait for response
            seq = this.sequence;

            // Write to localStorage
            localStorage.setItem("Seq", JSON.stringify(seq));
        }

        return seq;
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
                { id: 300, complete: false, routerUrl: ['sequence/page/:id']}
            ]
        }
        

    ]};
}
