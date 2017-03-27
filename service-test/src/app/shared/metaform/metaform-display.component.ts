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
    }

    ngOnInit() {
        // NOTE(ian): We need to do this before running super.ngOnInit() so that
        // calculations work properly.
        this.tracker.registerTaskProvider(this);
        super.ngOnInit();
    }

    ngOnDestroy() {
        this.tracker.unregisterTaskProvider(this);
        super.ngOnDestroy();
    }

    initialise(): void {
        let path = decodeURIComponent(window.location.pathname);

        let param = this.route.snapshot.queryParams['f'];
        let overrideCurrentQuestion = param === 'l';
        
        let t: Task = this.tracker.taskByPathName(path);

        this.windowSize.width$.subscribe( x => { this.isMobile = (window.innerWidth <= 800); });

        this.formName = this.route.snapshot.params['formName'];
        this.form = this.formService.loadForm(this.formName);

        this.currentQuestion = -1;

        if( overrideCurrentQuestion ){
            this.currentQuestion = this.form.totalQuestionCount - 2;
            // console.info(`Overriding start question -- showing question ${this.currentQuestion} out of ${this.form.totalQuestionCount}`);
        }

        this.tracker.setActiveTask(t);
        this.tracker.activeTask.totalSteps = this.form.questions.length - 1;
        this.sequenceTitle = this.tracker.getActiveSequence().title;
        this.displayQuestions();        
    }

    nextEnabled(): boolean { return this.isPageValid(); }
    previousEnabled(): boolean { return true; }
    currentProcessCompletePercent(): [number, number, number] {
        let p = 0;

        p = ( this.currentQuestion + 1 ) / ( this.form.totalQuestionCount + 1) * 100;
        // console.debug(`MetaformDisplayComponent->Complete: ${p}% ( ${this.currentQuestion}/${this.form.totalQuestionCount} )`);

        return [p, this.currentQuestion + 1, this.form.totalQuestionCount + 1];
    }

    stepNext(): boolean {
        this.displayQuestions();
        return true;
    }

    stepPrevious(): boolean {
        this.displayQuestions(false);
        return true;
    }

    private displayQuestions( forward = true ) {
        // TODO(ian): override display type 
        this.isMobile = true;

        let result = this.formService.getNextQuestionBlock(this.form, this.applicationService, this.isMobile, this.currentQuestion, forward);

        this.questionsToDisplay = result[0];
        this.currentQuestion = result[1];

        if( this.questionsToDisplay ) {
            // console.info(`Current = ${this.currentQuestion}`);
            // console.info(`displayQuestions: result.questions: ${this.questionsToDisplay.length}`);
            this.formGroup = this.formService.toFormGroup( this.questionsToDisplay );
            this.currentSection = this.formService.getSectionForQuestion( this.form, this.questionsToDisplay[0]);
            this.subtitle = this.currentSection.title;

            this.pageIsValid = this.isPageValid();
        // } else {
        //     console.error(`questionToDisplay is farked`);
        }
    
        this.tracker.calculateCurrentProgress();
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

    sequenceTitle: string;
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
