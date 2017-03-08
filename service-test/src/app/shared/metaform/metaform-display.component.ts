import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';

import { ApplicationService } from '../application/application.service';
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

        // NOTE(ian): Not sure we need to subscribe to this!
        // TODO(ian): Decide whether we want this done differently, for example
        // within the formService itself...
        this.windowSize.width$.subscribe( x => { 
            this.isMobile = (window.innerWidth <= 800);
            }
        );

        this.formName = this.route.snapshot.params['formName'];
        this.form = this.formService.loadForm(this.formName);

        let step = this.trackerService.getTrackerSequenceForFormName(1, this.formName);
        this.title = step.title;

        this.firstDisplayed = 0;
        this.currentQuestion = -1;

        this.displayQuestions();        
    }

    ngOnDestroy() : void {
        this.trackerService.removeProcessHost(this);
    }

    processTotalSteps(): number {
        return this.form.totalQuestionCount;
    }

    processCurrentStep(): number {
        return this.currentQuestion + 1;
    }

    handleNavigateNext(): boolean {
        // Get next question
        if( !this.atEnd ) {
            this.displayQuestions();
        } else {
            return false;
        }

        return true;
    }

    handleNavigatePrevious(): boolean {
        this.displayQuestions(false);

        return true;
    }

    private displayQuestions( forward = true ) {
        let result = this.formService.getNextQuestionBlock(this.form, this.applicationService, this.isMobile, this.currentQuestion, forward);

        this.questionsToDisplay = result[0];
        this.currentQuestion = result[1];
        this.atStart = result[2];
        this.atEnd = result[3];

        this.formGroup = this.formService.toFormGroup( this.questionsToDisplay );
        this.currentSection = this.formService.getSectionForQuestion( this.form, this.questionsToDisplay[0]);

        // let result = this.formService.whatToRender(this.form, this.currentSection, this.applicationService, this.firstQuestionToDisplay, this.isMobile, direction);

        // this.currentSection = result[0];
        // this.firstQuestionToDisplay = result[1];
        // this.questionsToDisplay = result[2].slice(0);
        // this.formGroup = result[3];
        // this.atStart = result[4];
        // this.atEnd = result[5];
        // this.currentQuestion = result[6];

        this.subtitle = this.currentSection.title;

        this.payLoad = JSON.stringify(this.form);
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

    payLoad: string;
}
