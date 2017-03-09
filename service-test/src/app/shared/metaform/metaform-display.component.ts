import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';

import { ApplicationService } from '../application/application.service';
import { IBusinessRuleData } from '../rule/business-rule';
import { TrackerService, ITrackedProcess } from '../tracker/tracker.service';

import { MetaformService } from './metaform.service';
import { Metaform, MetaformSection, MfQuestion, MfValueChangeEvent } from './metaform';

import { WindowSize } from '../framework/window-size';

// https://angular.io/docs/ts/latest/cookbook/dynamic-form.html
// TODO(ian): add the individual displays for each component question

@Component({
    templateUrl: './metaform-display.component.html',
    styleUrls: ['./metaform-display.component.css']
})

export class MetaformDisplayComponent implements OnInit, OnDestroy, ITrackedProcess {
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private windowSize: WindowSize,
        private applicationService: ApplicationService,
        private trackerService: TrackerService,
        private formService: MetaformService
    ) {}

    ngOnInit() {
        this.trackerService.addProcessHost(this);

        this.windowSize.width$.subscribe( x => { this.isMobile = (window.innerWidth <= 800); });

        this.formName = this.route.snapshot.params['formName'];
        this.form = this.formService.loadForm(this.formName);

        let step = this.trackerService.getTrackerSequenceForFormName(1, this.formName);
        this.title = step.title;

        this.firstDisplayed = 0;
        this.currentQuestion = -1;

        // NOTE(ian): This may not always be true, based on how far through the applicant
        // was when they last quit out of the system
        this.atStart = true;
        this.atEnd = false;
        step.currentStep = 0;

        if( !this.atStart && !this.atEnd) {
            this.displayQuestions();        
        }
    }

    ngOnDestroy() : void {
        this.trackerService.removeProcessHost(this);
    }

    processTotalSteps(): number {
        return this.form.totalQuestionCount + 1;
    }

    enableNext(): boolean {
        if( this.atEnd || this.atStart )
            return true;

        // Need to check all items! 
        return this.isPageValid();
    }

    enablePrevious(): boolean {
        // Probably should ALWAYS be true?
        return true; 
    }

    processComplete(): boolean {
        let result = this.formService.isValid(this.form, this.applicationService);
        let isValid = result[0];
        let errorList = result[1];

        console.log(`Metaform: isValid ${isValid}`);
        if( !isValid ) {
            errorList.forEach(s => {
                console.error(s);
            });
        }

        return isValid && this.processCurrentStep() == this.processTotalSteps();
    }

    processCurrentStep(): number {
        if( this.atEnd ) {
            return this.processTotalSteps();
        } else if ( this.atStart ) {
            return 0;
        } else {
            return this.currentQuestion + 1;
        }
    }

    handleNavigateNext(): boolean {
        this.atStart = false;

        // Get next question
        if( !this.atEnd ) {
            this.displayQuestions();
        } else {
            return false;
        }

        return true;
    }

    handleNavigatePrevious(): boolean {

        if( !this.atStart ) {
            console.log(`Not at start`);
            this.displayQuestions(false);
        } else {
            console.log(`At start`);
            return false;
        }

        return true;
    }
    
    getBusinessRuleDataForTracker() : IBusinessRuleData {
        return this.applicationService;
    }

    getActiveRoute(): ActivatedRoute { return this.route; }
    getRouter() : Router { return this.router; }

    private displayQuestions( forward = true ) {
        // TODO(ian): override display type 
        this.isMobile = true;

        let result = this.formService.getNextQuestionBlock(this.form, this.applicationService, this.isMobile, this.currentQuestion, forward);

        this.questionsToDisplay = result[0];
        this.currentQuestion = result[1];
        this.atStart = result[2];
        this.atEnd = result[3];

        console.info(`Current = ${this.currentQuestion}`);

        if( !this.atStart && !this.atEnd ) {
            this.formGroup = this.formService.toFormGroup( this.questionsToDisplay );
            this.currentSection = this.formService.getSectionForQuestion( this.form, this.questionsToDisplay[0]);
            this.subtitle = this.currentSection.title;
        }

        this.pageIsValid = this.isPageValid();
        //this.payLoad = JSON.stringify(this.form);
    }

    private isPageValid() : boolean {
        for(let q = 0; q < this.questionsToDisplay.length; q++) {
            let result = this.formService.isQuestionValid(this.questionsToDisplay[q], this.applicationService);
            let isValid = result[0];

            if( !isValid ) {
                return false;
            }
        }

        return true;
    }

    valueChanged(event: MfValueChangeEvent) {
        console.info(`value changed: ${event.name} = '${event.value}'`);
        this.applicationService.setValue(event.name, event.value);
    }

    onSubmit() {
        // this.payLoad = JSON.stringify(this.form.value);
    }

    title: string;
    subtitle: string;

    formName: string;
    
    form: Metaform;
    formGroup: FormGroup;
    
    isMobile: boolean;

    currentSection: MetaformSection;
    questionsToDisplay: MfQuestion[];
    firstDisplayed: number;
    currentQuestion: number;
    
    atStart: boolean;
    atEnd: boolean;

    pageIsValid: boolean;

    payLoad: string;
}
