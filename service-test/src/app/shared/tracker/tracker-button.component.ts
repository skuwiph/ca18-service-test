import { Component, OnInit, OnDestroy } from '@angular/core';

import { TrackerService } from './tracker.service';
import { TrackerEvent, TrackerEventType } from './tracker-event';

import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'tracker-buttons',
    templateUrl: './tracker-button.component.html',
    styleUrls: ['./tracker-button.component.css']
})
export class TrackerButtonComponent implements OnInit, OnDestroy {
    
    constructor( private tracker: TrackerService ) {} 

    ngOnInit() {
        this.subscription = this.tracker.trackerEventStream$
            .subscribe( event => this.taskServiceEvent(event) );
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    previousButton() : void {
        this.tracker.previous();
    }

    nextButton() : void {
        this.tracker.next();
    }
    
    enablePrevious(): boolean  { return this.tracker.canStepPrevious; }
    enableNext(): boolean { return this.tracker.canStepNext; }
    
    private taskServiceEvent( taskEvent: TrackerEvent ) {
        console.info(`trackerButtonComponent:taskServiceEvent: ${taskEvent.event}`);

        switch( taskEvent.event ){
            case TrackerEventType.Initialising:
                this.currentTaskName = "Initialising";
                break;
                
            case TrackerEventType.TasksLoaded:
                console.info(`Tasks Loaded`);
                this.currentTaskName = "Loaded";
                break;

            case TrackerEventType.ActiveTaskChanged:
                console.info(`Active task changed`);
                if( this.tracker.applicationTasks.activeTask ) {
                    this.currentTaskName = this.tracker.activeTask.name;
                } else {
                    if( this.tracker.applicationTasks.nextTaskInQueue ) {
                        this.currentTaskName = `No active task. Next will be ${this.tracker.applicationTasks.nextTaskInQueue.name}`;
                    } else {
                        this.currentTaskName = `No active or next task!`;
                    }
                }   
                break;
        }
    }

    currentTaskName: string = '';
    private subscription: Subscription;
       
}