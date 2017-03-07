import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';

import { ApplicationService } from '../application/application.service';
import { TrackerService, ITrackedProcess } from '../tracker/tracker.service';

import { MetaformService } from './metaform.service';
import { Metaform, MetaformSection, MfQuestion } from './metaform';

import { WindowSize } from '../framework/window-size';

// https://angular.io/docs/ts/latest/cookbook/dynamic-form.html
// TODO(ian): add the inividual displays for each component question

@Component({
    templateUrl: './metaform-display.component.html',
    styleUrls: ['./metaform-display.component.css']
})

export class MetaformDisplayComponent implements OnInit, OnDestroy, ITrackedProcess {
    title: string;
    subtitle: string;

    formName: string;
    
    form: Metaform;
    formGroup: FormGroup;
    checkModifiedAfter: Date;
    
    isReducedSize: boolean;

    currentSection: MetaformSection;
    questionsToDisplay: MfQuestion[];
    firstQuestionToDisplay: number;
    atEnd: boolean;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private windowSize: WindowSize,
        private applicationService: ApplicationService,
        private trackerService: TrackerService,
        private formService: MetaformService
    ) {
        // Initialise the first question
        this.firstQuestionToDisplay = 0;
     }

    ngOnInit() {
        this.trackerService.addProcessHost(this);

        // NOTE(ian): Not sure we need to subscribe to this!
        // TODO(ian): Decide whether we want this done differently, for example
        // within the formService itself...
        this.windowSize.width$.subscribe( x => { 
            console.debug("Size update");
            this.isReducedSize = (window.innerWidth <= 800);
            }
        );

        console.debug(`MetaformDisplayComponent: Route Params: ${this.route.snapshot.params['formName']}`);

        this.formName = this.route.snapshot.params['formName'];

        // Read form
        this.form = this.formService.loadForm(this.formName);
        console.log("Got form");
        this.checkModifiedAfter = this.form.checkModifiedAfter;
        //this.currentSection = this.form.sections[0];

        let step = this.trackerService.getTrackerSequenceForFormName(1, this.formName);

        console.debug(`On sequence ${step.id} with title '${step.title}. Total number of questions is ${this.form.totalQuestionCount}`);

        this.title = step.title;

        this.displayQuestions();        

        // IMPORTANT: the metaform code has to determine how many possible steps
        // there are, and use that value to calculate % complete; the tracker
        // won't know itself and is not responsible for determining how many pages
        // there are in a form

    }

    ngOnDestroy() : void {
        this.trackerService.removeProcessHost(this);
    }

    handleNavigateNext(): boolean {
        // Get next question
        if( !this.atEnd ) {
            console.debug("MetaformDisplayComponent is handling next");
            this.displayQuestions();
        } else {
            return false;
        }

        return true;
    }

    handleNavigatePrevious(): boolean {
        console.debug("MetaformDisplayComponent is handling previous");
        this.displayQuestions(-1);
        return true;
    }

    private displayQuestions(direction: number = +1 ) {
        let result = this.formService.whatToRender(this.form, this.currentSection, this.applicationService, this.firstQuestionToDisplay, this.isReducedSize, direction);

        this.currentSection = result[0];
        this.firstQuestionToDisplay = result[1];
        this.questionsToDisplay = result[2].slice(0);
        this.formGroup = result[3];
        this.atEnd = result[4];

        this.subtitle = this.currentSection.title;
        console.log(`current sequence id : ${this.trackerService.currentSequenceId}, ${this.trackerService.currentSequenceStepId}`);
    }

    onSubmit() {
        // this.payLoad = JSON.stringify(this.form.value);
    }
}
