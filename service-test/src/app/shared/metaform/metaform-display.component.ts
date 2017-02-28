import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup } from '@angular/forms';

import 'rxjs/add/operator/switchMap';

import { TrackerService } from '../tracker/tracker.service';

import { MetaformService } from './metaform.service';
import { Metaform, MfQuestion } from './metaform';

// https://angular.io/docs/ts/latest/cookbook/dynamic-form.html
// TODO(ian): add the inividual displays for each component question

@Component({
    templateUrl: './metaform-display.component.html',
    styleUrls: ['./metaform-display.component.css']
})

export class MetaformDisplayComponent implements OnInit {
    questions: MfQuestion<any>[] = [];
    formName: string;
    form: Metaform;
    formGroup: FormGroup;

    payLoad = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private trackerService: TrackerService,
        private formService: MetaformService
    ) { }

    ngOnInit() {
        console.log("MetaformDisplayComponent");
        console.debug(`Route Params: ${this.route.params['formName']}`);

        this.formName = this.route.params['formName'];

        this.form = this.formService.loadForm(this.formName);

        // TODO(ian): The formService needs to know how many questions to
        // export at a time, based on the screen/viewport width.

        // Also, we need to determine what 'page' we are on, since that
        // will determine where we start outputting from.
        this.formGroup = this.formService.toFormGroup(this.form);
        //this.questions = this.formGroup
    }

    onSubmit() {
        // this.payLoad = JSON.stringify(this.form.value);
    }
}
