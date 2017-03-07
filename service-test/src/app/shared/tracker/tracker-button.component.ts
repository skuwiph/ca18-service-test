import { Component, OnInit } from '@angular/core';

import { TrackerService } from './tracker.service';

@Component({
    selector: 'tracker-buttons',
    templateUrl: './tracker-button.component.html',
    styleUrls: ['./tracker-button.component.css']
})
export class TrackerButtonComponent implements OnInit {
    
    constructor( private trackerService: TrackerService ) {} 

    ngOnInit() : void {
    }

    previousButton() : void {
        console.log("TrackerButton::Previous...");

        this.trackerService.previous();
    }

    nextButton() : void {
        console.log("TrackerButton::Next...");

        this.trackerService.next();
    }
    
    nextDisabled(): boolean { return !this.trackerService.enableNextButton(); }
    previousDisabled(): boolean { return !this.trackerService.enablePreviousButton(); }
}