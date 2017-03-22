import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';

import { Observable } from 'rxjs/Observable';

import { TrackerService } from '../shared/tracker/tracker.service';
import { TrackedTaskComponent } from '../shared/tracker/tracked-task.component';
import { ITaskProvider } from '../shared/tracker/task-provider';
import { Task } from '../shared/tracker/task';

import { ApplicationService } from '../shared/application/application.service';
import { IBusinessRuleData } from '../shared/rule/business-rule';

@Component({
    templateUrl: './create-application.component.html'
})
export class CreateApplicationComponent extends TrackedTaskComponent implements OnInit, OnDestroy, ITaskProvider {
    
    constructor(
        private route: ActivatedRoute,
        private router: Router,        
        private applicationService: ApplicationService,
        private tracker: TrackerService 
    ) {
        super(router, tracker);
        console.log("Got app and tracker service");
    } 

    ngOnInit(){
        super.ngOnInit();

        this.tracker.registerTaskProvider(this);
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        this.tracker.unregisterTaskProvider(this);
    }

    initialise(): void {
        console.log(`CreateApplicationComponent:Init`);
        var path = window.location.pathname;
        console.info(`Route: ${path}`);
        let t: Task = this.tracker.taskByPathName(path);
        console.info(`Task is ${t.name}, Id = ${t.id}`);

        this.tracker.setActiveTask(t);
        this.sequenceTitle = this.tracker.activeTask.sequence.title;
    }

    nextEnabled(): boolean { if( this.validButton && this.validButton === 'Y' ) { return true; } else return false; }
    previousEnabled(): boolean { return true; }
    currentProcessCompletePercent(): [number, number, number] {
        let p = 0;

        p = ( this.tracker.activeTask.currentStep + 1 ) / 4 * 100;

        return [p, ( this.tracker.activeTask.currentStep + 1 ), 4];
    }

    stepNext(): boolean {return false;}
    stepPrevious(): boolean {return false;}


    validClick($event) {
        console.debug(`Valid click! ${$event}`);
    }

    private sequenceTitle: string;
    private validButton: string;
}