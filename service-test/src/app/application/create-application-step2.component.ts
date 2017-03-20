import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';

import { Observable } from 'rxjs/Observable';

import { TrackedTaskComponent } from '../shared/tracker/tracked-task.component';

import { TrackerService } from '../shared/tracker/tracker.service';
import { ITaskProvider } from '../shared/tracker/task-provider';
import { Task } from '../shared/tracker/task';

import { ApplicationService } from '../shared/application/application.service';
import { IBusinessRuleData } from '../shared/rule/business-rule';

@Component({
    templateUrl: './create-application-step2.component.html'
})
export class CreateApplicationStep2Component extends TrackedTaskComponent implements OnInit, OnDestroy, ITaskProvider {
    
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
        console.log(`CreateApplicationStep2Component:Init`);
        var path = window.location.pathname;
        let t: Task = this.tracker.taskByPathName(path);
        this.tracker.setActiveTask(t);
        this.sequenceTitle = this.tracker.activeTask.sequence.title;
    }

    nextEnabled(): boolean { return true; }
    previousEnabled(): boolean { return true; }
    currentProcessCompletePercent(): number {
        let p = 0;

        p = ( this.tracker.activeTask.currentStep + 1 ) / 4 * 100;

        return p;
    }

    private sequenceTitle: string;
}