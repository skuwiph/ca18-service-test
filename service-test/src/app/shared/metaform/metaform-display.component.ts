import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';

import { ApplicationService } from '../application/application.service';
import { TrackerService } from '../tracker/tracker.service';

import { MetaformService } from './metaform.service';
import { Metaform, MetaformSection, MfQuestion } from './metaform';

import { WindowSize } from '../framework/window-size';

// https://angular.io/docs/ts/latest/cookbook/dynamic-form.html
// TODO(ian): add the inividual displays for each component question

@Component({
    templateUrl: './metaform-display.component.html',
    styleUrls: ['./metaform-display.component.css']
})

export class MetaformDisplayComponent implements OnInit {
    title: string;
    subtitle: string;

    formName: string;
    
    form: Metaform;
    formGroup: FormGroup;
    checkModifiedAfter: Date;
    
    isReducedSize: boolean;

    currentSection: MetaformSection;
    questionsToDisplay: MfQuestion[];
    
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private windowSize: WindowSize,
        private applicationService: ApplicationService,
        private trackerService: TrackerService,
        private formService: MetaformService
    ) { }

    ngOnInit() {
        console.debug(`MetaformDisplayComponent: Route Params: ${this.route.snapshot.params['formName']}`);

        this.formName = this.route.snapshot.params['formName'];

        // Read form
        this.form = this.formService.loadForm(this.formName);
        console.log("Got form");
        this.checkModifiedAfter = this.form.checkModifiedAfter;

        let step = this.trackerService.getTrackerSequenceForFormName(1, this.formName);

        console.debug(`On sequence ${step.id} with title '${step.title}. Total number of questions is ${this.form.totalQuestionCount}`);

        this.title = step.title;

        // IMPORTANT: the metaform code has to determine how many possible steps
        // there are, and use that value to calculate % complete; the tracker
        // won't know itself and is not responsible for determining how many pages
        // there are in a form
        this.currentSection = this.form.sections[0];
        this.subtitle = this.currentSection.title;

        //this.formGroup = this.formService.groupForName(targetQuestion);

        console.log(`current sequence id : ${this.trackerService.currentSequenceId}, ${this.trackerService.currentSequenceStepId}`);

        // If we have a target question, target it
        // TODO(ian): The formService needs to know how many questions to
        // export at a time, based on the screen/viewport width.

        // NOTE(ian): Not sure we need to subscribe to this!
        this.windowSize.width$.subscribe( x => { 
            console.debug("Size update");
            this.isReducedSize = (window.innerWidth <= 800);
            }
        );

        // Also, we need to determine what 'page' we are on, since that
        // will determine where we start outputting from.
        //this.formGroup = this.formService.toFormGroup(this.form);
        //this.questions = this.formGroup
    }

    onSubmit() {
        // this.payLoad = JSON.stringify(this.form.value);
    }
}
