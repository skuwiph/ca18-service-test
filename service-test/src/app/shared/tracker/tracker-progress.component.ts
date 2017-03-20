import { Component, OnInit } from '@angular/core';

import { NgbProgressbar } from '@ng-bootstrap/ng-bootstrap';

import { TrackerService } from './tracker.service';

@Component({
    selector: 'tracker-progress',
    templateUrl: './tracker-progress.component.html'
})
export class TrackerProgressComponent implements OnInit {
    percentComplete(): number {
         return this.tracker.currentProcessCompletePercent(); 
    }

    constructor( private tracker: TrackerService) {} 

    ngOnInit() : void {
    }
}