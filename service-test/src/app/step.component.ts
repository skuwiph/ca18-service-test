import { Component } from '@angular/core';

import { TrackerService } from './shared/tracker/tracker.service';

@Component({
    templateUrl: './step.component.html',
    styleUrls: ['./step.component.css']
})
export class StepComponent {
    
    constructor(private tracker: TrackerService ) {
        console.log("Got tracker service");

    }
}
