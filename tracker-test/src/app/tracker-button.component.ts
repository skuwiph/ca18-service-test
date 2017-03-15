import { Component, OnInit } from '@angular/core';

import { TrackerService } from './tracker.service';

@Component({
    selector: 'tracker-button',
    template: `
        <pre>{{ currentTaskName }}</pre>
        <button [disabled]="!enablePrevious()" (click)="previousStep()">Previous</button>
        <button [disabled]="!enableNext()" (click)="nextStep()">Next</button>`,
    styles: [`
        button { width: 5em; background-color: blue; color: white; border: 1px solid blue; border-radius: 3px; padding: 3px 4px; margin: 0 1em 0 0; }
        button[disabled] { color: #ddd; background-color: #aaa; border: 1px solid #aaa; cursor: not-allowed; }
        ` ]
})
export class TrackerButtonComponent implements OnInit {
    title = 'app works!';

    constructor(private tracker: TrackerService ) {}

    ngOnInit() {
        console.info(`In TrackerButtonComponent`);
        if( this.tracker.applicationTasks.activeTask ) {
            this.currentTaskName = this.tracker.applicationTasks.activeTask.name;
        } else {
            this.currentTaskName = `No active task. Next will be ${this.tracker.applicationTasks.nextTaskInQueue.name}`;
        }
    }

    enablePrevious(): boolean  { return false; }
    enableNext(): boolean { return true; }

    nextStep(): void {
        console.info(`Click: NextStep`);
        this.tracker.next();
    }

    previousStep(): void {
        console.info(`Click: PreviousStep`);
    }

    currentTaskName: string = '';
}
