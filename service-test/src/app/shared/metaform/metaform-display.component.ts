import { Component, Input, OnInit } from '@angular/core';

import { FormGroup }                 from '@angular/forms';

import { TrackerService } from '../tracker/tracker.service';

import { MetaformService } from './metaform.service';
import { MfQuestion }              from './metaform';

// https://angular.io/docs/ts/latest/cookbook/dynamic-form.html
// TODO(ian): add the inividual displays for each component question

@Component({
    // moduleId: module.id,
    selector: 'app-metaform-display',
    templateUrl: './metaform-display.component.html',
    styleUrls: ['./metaform-display.component.css']
})

export class MetaformDisplayComponent implements OnInit {
    @Input() formName: string;
    questions: MfQuestion<any>[] = [];
    form: FormGroup;
    payLoad = '';

    constructor(
        private trackerService: TrackerService,
        private formService: MetaformService
    ) { }

    ngOnInit() {
        console.log("MetaformDisplayComponent");
        this.form = this.formService.toFormGroup( this.formService.loadForm(this.formName) );
    }

    onSubmit() {
        this.payLoad = JSON.stringify(this.form.value);
    }
}
