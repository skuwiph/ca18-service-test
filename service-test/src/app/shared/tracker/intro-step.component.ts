import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { TrackerService } from './tracker.service';

@Component({
    // selector: 'tracker-intro',
    templateUrl: './intro-step.component.html',
    //styleUrls: ['./metaform-display.component.css']
})
export class IntroStepComponent implements OnInit, OnDestroy {

    constructor( 
        private route: ActivatedRoute,
        private router: Router,
        private tracker: TrackerService ) {}

    ngOnInit() {
        this.formName = this.route.snapshot.params['formName'];
        //this.form = this.formService.loadForm(this.formName);

        let step = this.tracker.getTrackerSequenceForFormName(1, this.formName);
        this.title = step.title;

    }

    ngOnDestroy() {
        // TODO(ian): is this needed?
    }

    private formName: string;
    private title: string;

}