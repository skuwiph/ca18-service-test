import { Component, OnInit } from '@angular/core';

import { TrackerService } from './tracker.service';

@Component({
    selector: 'tracker-buttons',
    templateUrl: './tracker-button.component.html',
    styleUrls: ['./tracker-button.component.css']
})
export class TrackerButtonComponent implements OnInit {
    
    constructor( private tracker: TrackerService ) {} 

    ngOnInit() : void {
        console.info(`In TrackerButtonComponent`);
        console.debug(`Reading tracker applicationTasks`);

        if( this.tracker.applicationTasks ) {
            if( this.tracker.activeTask ) {
                this.currentTaskName = this.tracker.activeTask.name;
            } else {
                if( this.tracker.applicationTasks.nextTaskInQueue ) {
                    this.currentTaskName = `No active task. Next will be ${this.tracker.applicationTasks.nextTaskInQueue.name}`;
                } else {
                    this.currentTaskName = `No active or next task!`;
                }
            }   
        } else {
            this.currentTaskName = 'No application tasks!';
        }
    }

    previousButton() : void {
        console.log("TrackerButton::Previous...");

        this.tracker.previous();
    }

    nextButton() : void {
        console.log("TrackerButton::Next...");

        this.tracker.next();
    }
    
    enablePrevious(): boolean  { return this.tracker.canStepPrevious; }
    enableNext(): boolean { return this.tracker.canStepNext; }
    
    currentTaskName: string = '';
}