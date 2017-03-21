import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';

import { ApplicationService } from '../application/application.service';
import { IBusinessRuleData } from '../rule/business-rule';
import { TrackerService } from '../tracker/tracker.service';
import { TrackedTaskComponent } from '../tracker/tracked-task.component';
import { ITaskProvider } from '../tracker/task-provider';
import { Task } from '../tracker/task';

import { MetaformService } from './metaform.service';
import { Metaform, MetaformSection, MfQuestion, MfValueChangeEvent } from './metaform';

import { WindowSize } from '../framework/window-size';
import { getUrlParameter } from '../framework/query-params';

// https://angular.io/docs/ts/latest/cookbook/dynamic-form.html
// TODO(ian): add the individual displays for each component question

@Component({
    templateUrl: './metaform-display.component.html',
    styleUrls: ['./metaform-display.component.css']
})

export class MetaformDisplayComponent extends TrackedTaskComponent implements OnInit, OnDestroy, ITaskProvider {
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private windowSize: WindowSize,
        private applicationService: ApplicationService,
        private tracker: TrackerService,
        private formService: MetaformService
    ) {
        super(router, tracker);
        console.info(`MetaformDisplayComponent`);}

    ngOnInit() {
        console.info(`MetaformDisplayComponent::ngOnInit`);
        super.ngOnInit();

        this.tracker.registerTaskProvider(this);

    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.tracker.unregisterTaskProvider(this);
    }

    initialise(): void {
        console.log(`MetaformDisplayComponent:Init`);
        let path = window.location.pathname;
        //let urlParams = new URLSearchParams(window.location.search);
        //let overrideCurrentQuestion = urlParams.get('f') === 'l';
        let overrideCurrentQuestion = getUrlParameter('f') === '1';
        

        let t: Task = this.tracker.taskByPathName(path);

        this.windowSize.width$.subscribe( x => { this.isMobile = (window.innerWidth <= 800); });

        this.formName = this.route.snapshot.params['formName'];
        this.form = this.formService.loadForm(this.formName);

        // this.firstDisplayed = 0;
        this.currentQuestion = -1;

        if( overrideCurrentQuestion ){
            this.currentQuestion = this.form.totalQuestionCount - 2;
        }

        this.tracker.setActiveTask(t);
        this.tracker.activeTask.totalSteps = this.form.questions.length;
        this.title = this.tracker.activeTask.sequence.title;

        this.displayQuestions();        
    }

    nextEnabled(): boolean { return this.isPageValid(); }
    previousEnabled(): boolean { return true; }
    currentProcessCompletePercent(): number {
        let p = 0;

        console.info(`CurrentStep: ${this.tracker.activeTask.currentStep}. Total: ${this.tracker.activeTask.totalSteps}`);

        p = ( this.currentQuestion + 1 ) / ( this.form.totalQuestionCount + 2 ) * 100;

        return p;
    }

    stepNext(): boolean {
        console.info(`Increment page display count`);
        this.displayQuestions();
        return true;
    }

    stepPrevious(): boolean {
        console.info(`Decrement page display count`);
        this.displayQuestions(false);
        return true;
    }

    private displayQuestions( forward = true ) {
        console.info(`displayQuestions`);
        // TODO(ian): override display type 
        this.isMobile = true;

        // // TODO(ian): Hrm
        // //this.currentQuestion = this.tracker.activeTask.currentStep - 1;
        console.info(`current question to display: ${this.currentQuestion}`);

        let result = this.formService.getNextQuestionBlock(this.form, this.applicationService, this.isMobile, this.currentQuestion, forward);

        this.questionsToDisplay = result[0];
        this.currentQuestion = result[1];
        // this.atStart = result[2];
        // this.atEnd = result[3];

        console.info(`Current = ${this.currentQuestion}`);
        console.info(`displayQuestions: result.questions: ${this.questionsToDisplay.length}`);

        this.formGroup = this.formService.toFormGroup( this.questionsToDisplay );
        this.currentSection = this.formService.getSectionForQuestion( this.form, this.questionsToDisplay[0]);
        this.subtitle = this.currentSection.title;

        this.pageIsValid = this.isPageValid();

        // if( this.atEnd )        {
        //     console.log("At end, checking complete for tracker");
        //     let result = this.formService.isValid(this.form, this.applicationService);
        //     let isValid = result[0];
        //     if( isValid ) {
        //         // this.trackerService.currentSequence.complete = true;
        //     }

        // }
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
    // firstDisplayed: number;
    currentQuestion: number;
    
    pageIsValid: boolean;

    payLoad: string;
}
