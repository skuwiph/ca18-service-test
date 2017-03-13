import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { TrackerService } from './tracker.service';

@Component({
    // selector: 'tracker-intro',
    templateUrl: './reward-step.component.html',
    //styleUrls: ['./metaform-display.component.css']
})
export class RewardStepComponent implements OnInit, OnDestroy {

    constructor( private tracker: TrackerService ) {

    }

    ngOnInit() {
        // Not sure if needed?
    }

    ngOnDestroy() {
        // TODO(ian): is this needed?
    }

}