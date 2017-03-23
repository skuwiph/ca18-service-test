import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { TrackerService } from '../tracker/tracker.service';


export abstract class TrackedTaskComponent implements OnInit, OnDestroy {    
    constructor(
        private sc_router: Router,
        private sc_tracker: TrackerService
    ) {}

    ngOnInit() {
        if( !this.sc_tracker.applicationTasks || !this.sc_tracker.applicationTasks.activeTask ) {
            // console.debug("Got no active task, routing to basepath");
            this.sc_router.navigateByUrl("home");
        } else {
            // console.info(`TrackedTaskComponent: Active: ${this.sc_tracker.applicationTasks.activeTask.name}`);
            this.initialise();
        }
    }

    ngOnDestroy() {}

    protected abstract initialise(): void;
}