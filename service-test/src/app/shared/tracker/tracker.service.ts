import { Injectable } from '@angular/core';
import { Router,ActivatedRoute  } from '@angular/router';

import { Http } from '@angular/http';

import { ApplicationService } from '../application/application.service';
import { BusinessRuleService } from '../rule/business-rule.service';
import { IBusinessRuleData, BusinessRule } from '../rule/business-rule';

import { MetaformService } from '../metaform/metaform.service';

import { ApplicationSequence, TrackerSequence, TrackerSequenceType } from './tracker-sequence';

export interface ITrackedProcess {
    handleNavigateNext(): boolean;
    handleNavigatePrevious(): boolean;

    processTotalSteps(): number;
    processCurrentStep(): number;

    processComplete(): boolean;

    getBusinessRuleDataForTracker() : IBusinessRuleData;
    getActiveRoute(): ActivatedRoute;
    getRouter() : Router;

    enableNext(): boolean;
    enablePrevious(): boolean;
}

@Injectable()
export class TrackerService implements ITrackedProcess {

    constructor(
        private http: Http,
        private applicationService: ApplicationService,
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

    processTotalSteps(): number {
        return 1;
    }

    processCurrentStep(): number {
        return 1;
    }

    processComplete(): boolean {
        return this.processCurrentStep() == this.processTotalSteps();
    }

    enableNext(): boolean { return true; }
    enablePrevious(): boolean { return true; }

    handleNavigateNext(): boolean {
        console.debug("I'm handling navigation!");

        return false;
    }

    handleNavigatePrevious(): boolean {
        console.debug("I'm handling navigation!");

        return false;
    }

    getBusinessRuleDataForTracker() : IBusinessRuleData {
        return this.applicationService;
    }

    getActiveRoute(): ActivatedRoute { return null; }
    getRouter() : Router { return null; }


    next(): void {
        console.log(`TrackerService:next()`);

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

            this.findPreviousStep();
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
        return this.trackedProcess.enableNext(); 
    }

    enablePreviousButton(): boolean 
    { 
        return this.trackedProcess.enablePrevious(); 
    }

    // // TODO(ian): @ugh
    // // Read the latest sequence item for this application.
    // // NOTE: Assumes rules are available from the service.
    // latestSequenceItem( applicationId: number, dataSource: IBusinessRuleData ) : SequenceStep {
    //     let rules = this.ruleService.getCurrentRules();

    //     let app = this.loadSequenceForApplication( applicationId, true );
    //     let seq = this.findFirstMatchingSequence(
    //         app,
    //         rules,
    //         dataSource
    //     );
    //     let step = this.findFirstMatchingStep( seq, rules, dataSource );
    //     return step;
    // }

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

        // this.applicationSequenceId += 1;
        // console.log(`Current sequence Id = ${this.applicationSequenceId}`)

        // Store for our own purposes!
        this.applicationSequence = seq;

        return seq;
    }

    
    findPreviousStep() {
        // If a previous step is complete, we should automatically return to the 
        // designated home page
        if( this.currentSequence === undefined || this.currentSequence === null )
        {
            console.log("No current, nothing to work from");
            return;
        }

        let lastSequence = null;

        for(let s of this.applicationSequence.sequence){
            if( s.id === this.currentSequence.id) {
                // Got this one
                if( lastSequence === null ) {
                    console.log("No last sequence, we were at the first!");

                    this.navigateToNextStep( this.applicationSequence.homePageUrl, this.trackedProcess.getRouter(), this.trackedProcess.getActiveRoute() );
                } else {
                    this.navigateToNextStep( lastSequence.routerUrl, this.trackedProcess.getRouter(), this.trackedProcess.getActiveRoute() );
                }
            }
            lastSequence = s;
        }
    }

    findNextStep() {
        let matchingSequence: TrackerSequence;
        this.ruleService.setRules(this.ruleService.getCurrentRules());

        // Have we finished the current sequence?
        if( this.currentSequence !== undefined ) {
            console.log(`found current sequence, checking next available step from ${this.currentSequence.title}`);
            console.info(`Current/Total: ${this.trackedProcess.processCurrentStep()} == ${this.trackedProcess.processTotalSteps()}`);

            // Is this sequence complete?
            if( this.trackedProcess.processComplete() ) {
                this.currentSequence.complete = true;
            }
        }

        // Start on current sequence
        for(let s of this.applicationSequence.sequence) {
            if( !s.complete ) {
                this.currentSequence = s;
                this.currentSequence.currentStep = 0;

                // Navigate
                this.navigateToNextStep( s.routerUrl, this.trackedProcess.getRouter(), this.trackedProcess.getActiveRoute() );

                // Early exit!
                break;
            }
        }
    }    

    // TODO(ian): @ugh
    // NOTE(ian): Given we have a set of sequences, which one should
    // we display next?
    findFirstMatchingSequence( data: IBusinessRuleData ) : TrackerSequence {
        //let seq = this.getSequenceFromStorage();
        let matchingSequence: TrackerSequence;
        if( this.applicationSequence === null ) {
            return null;
        }

        this.ruleService.setRules(this.ruleService.getCurrentRules());
        let overrideSequence = 0;

        // There may be a priority override!
        if( this.applicationSequence.prioritySequenceId.length > 0) {
            overrideSequence = this.applicationSequence.prioritySequenceId[0];
        }

        for(let s of this.applicationSequence.sequence ) {
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

        // Initialise
        // NOTE(ian): there may be cases where this is NOT the first page
        matchingSequence.currentStep = 0;

        return matchingSequence;
    }


    /**
     * Find the tracker sequence matching the passed metaform name
     * @param applicationId - the application Id of the signed-in user
     * @param formName - the name of the form (from the url)
     */
    getTrackerSequenceForFormName( applicationId: number, formName: string ) : TrackerSequence {
        let matchingSequence: TrackerSequence;
        let applicationSequence = this.loadSequenceForApplication(applicationId, true);
    
        if( applicationSequence === null || applicationSequence.sequence === null ) {
            return null;
        }

        // let rules = this.ruleService.getCurrentRules();
        // this.ruleService.setRules(rules);

        for(let s of applicationSequence.sequence ) {
            // Find the matching sequence
            if( s.type == TrackerSequenceType.Metaform && s.metaformName == formName )  {
                // TODO(ian): Do we need to check the rules in this scenario?
                // if( s.ruleToMatch !== undefined ) {
                    matchingSequence = s;
                    break;
                // }
            }
        }

        this.applicationSequence = applicationSequence;
        this.currentSequence = matchingSequence;

        return matchingSequence;
    }

    navigateToStep( sequence: TrackerSequence, router: Router ) : void {
        router.navigate([ sequence.routerUrl ]);
    }

    markSequenceComplete( applicationSequence: ApplicationSequence, sequence: TrackerSequence ) {
        // Mark as completed
        sequence.complete = true;

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

    private sequence: ApplicationSequence = {
        sequence: [
            {id: 1, complete: true, title: 'A completed sequence item', type: TrackerSequenceType.Custom, sequenceIntroPage: 'step', sequenceOutroPage: 'step', routerUrl: '/step'},
            {id: 2, complete: false, title: 'Prepare for interview', type: TrackerSequenceType.Metaform, metaformName: 'this-is-my-form',  sequenceIntroPage: 'start', sequenceOutroPage: 'end', routerUrl: 'form/this-is-my-form'},
            {id: 3, complete: false, title: 'An incomplete sequence item', type: TrackerSequenceType.Custom, sequenceIntroPage: 'step', sequenceOutroPage: 'step', routerUrl: '/step', ruleToMatch:'Test String Rule'},
        ],  
        prioritySequenceId: [],
        homePageUrl: '/step'
    };

    public applicationSequence: ApplicationSequence;
    public currentSequence: TrackerSequence;

    // public applicationSequenceId: number;
    // public applicationSequenceStepId: number;

    public get progressPercent(): number {
        return (this.trackedProcess.processCurrentStep() / this.trackedProcess.processTotalSteps() ) * 100;
    }

    private trackedProcess: ITrackedProcess;
}
