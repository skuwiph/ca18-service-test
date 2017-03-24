import { Component, OnInit, OnDestroy } from '@angular/core';

import { NgbProgressbar } from '@ng-bootstrap/ng-bootstrap';

import { TrackerService } from './tracker.service';
import { TrackerTaskEvent } from './tracker-task-event';

import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'tracker-progress',
    templateUrl: './tracker-progress.component.html'
})
export class TrackerProgressComponent implements OnInit, OnDestroy {
    constructor( private tracker: TrackerService) {} 

    ngOnInit() {
        this.subscription = this.tracker.trackerTaskEventStream$
            .subscribe( event => this.percent = event.percentComplete );
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    private subscription: Subscription;
    private percent: number;
}