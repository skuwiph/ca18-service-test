import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

import { NgbProgressbar } from '@ng-bootstrap/ng-bootstrap';

import { TrackerService } from './tracker.service';

@Component({
    selector: 'tracker-progress',
    templateUrl: './tracker-progress.component.html'
})
export class TrackerProgressComponent implements OnInit {
    percentComplete(): number { return this.trackerService.progressPercent; }

    constructor( private trackerService: TrackerService, private sanitizer: DomSanitizer ) {
    } 

    ngOnInit() : void {
    }
}