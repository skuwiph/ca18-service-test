    import { Injectable } from '@angular/core';
import { Router,ActivatedRoute  } from '@angular/router';

import { Http } from '@angular/http';

import { BusinessRuleService } from '../rule/business-rule.service';
import { IBusinessRuleData, BusinessRule } from '../rule/business-rule';

import { MetaformService } from '../metaform/metaform.service';

import { ApplicationSequence, TrackerSequence, TrackerSequenceType, SequenceStep } from './tracker-sequence';

export interface ITrackedProcess {
    handleNavigateNext(): boolean;
    handleNavigatePrevious(): boolean;
}

@Injectable()
export class TrackerService implements ITrackedProcess {

    constructor(
        private http: Http,
        private ruleService: BusinessRuleService,
        private formService: MetaformService
    ) {
        this.trackedProcess = this;
    }

    addProcessHost( host: ITrackedProcess ) {
        this.trackedProcess = host;
    }

    removeProcessHost(host: ITrackedProcess ) {
        if( host != this.trackedProcess )
            throw new Error("The process host being removed is not the one we were expecting! Check that all hosts have a call to this function in ngOnDestroy();");

        this.trackedProcess = this;
    }

    handleNavigateNext(): boolean {
        console.debug("I'm handling navigation!");

        return false;
    }

    handleNavigatePrevious(): boolean {
        console.debug("I'm handling navigation!");

        return false;
    }

    next(): void {
        console.log(`TrackerService:next() currentSequence: ${this.currentSequenceId}`);

        // We do this, regardless of who decides upon the next step
        this.updateServiceOfCurrentStep();

        if( this.trackedProcess.handleNavigateNext() ) {
            console.debug("TrackedProcess is handling next, not us");
        } else {
            console.debug("We're handling next");

            this.findNextStep();
        }

        // if ( this.currentHost !== undefined && !this.enableNextButton() ) return;

        // if ( this.currentHost !== undefined ) {
        //     this.currentHost.processNextLocally();
        // }
        // this.progressPercent++;

    }

    updateServiceOfCurrentStep() {
        console.info(`We're telling the service that there is a change in the last completed step by the applicant`);
    }

    previous(): void {
        console.log('TrackerService:previous()');

        if( this.trackedProcess.handleNavigatePrevious() ) {
            console.debug("TrackedProcess is handling previous, not us");
        } else {
            console.debug("We're handling previous");

            this.findNextStep();
        }
    }

    navigateToPreviousStep( url : any,  router: Router, route: ActivatedRoute ) : void {
        // TODO(ian): actually have appropriate behaviour here
        
        console.log(route.toString());
        console.log(`TrackerService: Navigating to '${url}'`);
        router.navigateByUrl( url );
    }

    navigateToNextStep( url : any,  router: Router, route: ActivatedRoute ) : void {
        // TODO(ian): actually have appropriate behaviour here
        console.log(route.toString());
        console.log(`TrackerService: Navigating to '${url}'`);
        router.navigateByUrl( url );
    }

    enableNextButton(): boolean 
    { 
        return true; 
    }

    enablePreviousButton(): boolean 
    { 
        return true; 
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
        
        if( forceRead )
            console.debug(`latestSequenceItem is forcing a read from Http`);

        if( seq === null || forceRead ) {
            seq = this.sequence;

            // Write to localStorage
            localStorage.setItem("Seq", JSON.stringify(seq));
        }

        // this.currentSequenceId += 1;
        // console.log(`Current sequence Id = ${this.currentSequenceId}`)

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

    findNextStep() {
        let matchingSequence: TrackerSequence;
        this.ruleService.setRules(this.ruleService.getCurrentRules());
        
        // Start on current sequence
        for(let s of this.currentSequence.sequence) {
            if( s.id == this.currentSequenceId ) {
                console.log(`found current sequence, checking next available step from ${this.currentSequenceStepId}`);
                // If it's a metaform, we should...?
                if( s.type == TrackerSequenceType.Metaform ) {
                    
                }
            }
        }
    }

    //
    // Find the tracker sequence matching the passed metaform name
    //
    getTrackerSequenceForFormName( applicationId: number, formName: string ) : TrackerSequence {
        console.debug(`Looking for form ${formName} for application ${applicationId}`);


        let matchingSequence: TrackerSequence;
        let applicationSequence = this.loadSequenceForApplication(applicationId, true);
    
        if( applicationSequence === null || applicationSequence.sequence === null ) {
            return null;
        }

        // let rules = this.ruleService.getCurrentRules();
        // this.ruleService.setRules(rules);

        for(let s of applicationSequence.sequence ) {
            // Find the matching sequence
            // TODO(ian): Do we need to check the rules in this scenario?
            if( s.type == TrackerSequenceType.Metaform && s.metaformName == formName )  {
                matchingSequence = s;
                break;
            }
        }

        this.currentSequence = applicationSequence;
        this.currentSequenceId = matchingSequence.id;
        this.currentSequenceStepId = matchingSequence.steps[0].id;
        return matchingSequence;
    }

    // TODO(ian): @ugh
    // Find first incomplete step
    findFirstMatchingStep( sequence: TrackerSequence, rules: BusinessRule[], dataSource: IBusinessRuleData ) : SequenceStep {
        let matchingStep: SequenceStep;
        if( sequence.steps ) {
            // TODO: will we need an early out
            sequence.steps.forEach((step, index) => {
                if( !step.complete) {
                    matchingStep = step;
                    sequence.currentStep = index;
                }
            });
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
        {id: 3, complete: false, title: 'A fancy metaform', type: TrackerSequenceType.Metaform, metaformName: 'this-is-my-form', 
            steps: [
                { id: 300, complete: false, routerUrl: ['form/this-is-my-form']}
            ]
        }
    ], prioritySequenceId: []};

    public currentSequence: ApplicationSequence;
    public currentSequenceId: number;
    public currentSequenceStepId: number;
    public progressPercent: number = 0;

    private trackedProcess: ITrackedProcess;
}
