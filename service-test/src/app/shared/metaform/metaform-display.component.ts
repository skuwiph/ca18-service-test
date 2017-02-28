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

        this.route.params
            .switchMap((params: Params) => this.formService.loadForm(params['formName']))
            .subscribe((f: Metaform) => this.form = f);

        this.formName = this.route.snapshot.params['formName'];
        this.formGroup = this.formService.toFormGroup(this.form);
    }

    onSubmit() {
        // this.payLoad = JSON.stringify(this.form.value);
    }
}
