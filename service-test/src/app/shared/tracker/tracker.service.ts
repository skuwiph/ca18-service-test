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
    ) {}


    // TODO(ian): @ugh
    loadNextSequenceForForm( applicationId: number, formName: string, dataSource: IBusinessRuleData) : string {
        let rules = this.ruleService.getCurrentRules();
        let app = this.loadSequenceForApplication( applicationId, true );
        let seq = this.loadFormSequenceByName(app, formName);

        return "";
    }

    // TODO(ian): @ugh
    // Read the latest sequence item for this application.
    // NOTE: Assumes rules are available from the service.
    latestSequenceItem( applicationId: number, dataSource: IBusinessRuleData ) : SequenceStep {
        let rules = this.ruleService.getCurrentRules();

        let app = this.loadSequenceForApplication( applicationId, true );
        let seq = this.findFirstMatchingSequence(
            app,
            rules,
            dataSource
        );
        let step = this.findFirstMatchingStep( seq, rules, dataSource );
        return step;
    }

    // TODO(ian): @ugh
    // NOTE(ian): return sequence for application
    // NOTE(ian): should be stored in localStorage
    loadSequenceForApplication(applicationId: number, forceRead?: boolean) : ApplicationSequence {
        // console.log(`Read sequence for application ${applicationId}`);

        let seq = this.getSequenceFromStorage();
        console.debug(`latestSequenceItem is forcing a read from Http`);

        if( seq === null || forceRead ) {
            seq = this.sequence;

            // Write to localStorage
            localStorage.setItem("Seq", JSON.stringify(seq));
        }

        return seq;
    }

    // TODO(ian): @ugh
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

    // TODO(ian): @ugh
    // Find the first incomplete step for the metaform sequence matching
    // the passed name
    loadFormSequenceByName( applicationId: number, formName: string ) : SequenceStep {
        let matchingSequence: TrackerSequence;
        let applicationSequence = this.loadSequenceForApplication(applicationId);
    
        if( applicationSequence === null || applicationSequence.sequence === null ) {
            return null;
        }

        this.ruleService.setRules(this.ruleService.getCurrentRules());

        for(let s of applicationSequence.sequence ) {
            // Find the matching sequence
            if( s.type == TrackerSequenceType.Metaform && s.metaformName == formName )  {
                matchingSequence = s;
                break;
            }
        }

        return matchingSequence;
    }

    // TODO(ian): @ugh
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

    // Read the next sequence for the passed application, the calling
    // code should find the step via the 'sequence.currentStep;
    getNextStepForApplication(applicationId: number) : TrackerSequence {
        return null;
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
        {id: 3, complete: false, title: 'A second incomplete sequence item', type: TrackerSequenceType.Metaform, 
            steps: [
                { id: 300, complete: false, routerUrl: ['form/this-is-MY-form']}
            ]
        }
    ], prioritySequenceId: []};
}
