import { Component, OnInit, OnDestroy } from '@angular/core';

import { NgbProgressbar } from '@ng-bootstrap/ng-bootstrap';

import { TrackerService, TrackerEvent } from './tracker.service';

import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'tracker-progress',
    templateUrl: './tracker-progress.component.html'
})
export class TrackerProgressComponent implements OnInit, OnDestroy {
    constructor( private tracker: TrackerService) {} 

    ngOnInit() {
        this.subscription = this.tracker.trackerEventStream$
            .subscribe( event => this.percent = event.percentComplete );

        //this.percent = this.tracker.currentProcessCompletePercent(); 
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    private subscription: Subscription;
    private percent: number;
}