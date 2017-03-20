import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { ApplicationService } from '../application/application.service';
import { IBusinessRuleData } from '../rule/business-rule';

import { TrackedTaskComponent } from '../tracker/tracked-task.component';

import { TrackerService } from '../tracker/tracker.service';
import { TaskIntro } from './task-intro';

@Component({
    templateUrl: './task-intro.component.html',
    styleUrls: ['./task-intro.component.css']
})

export class TaskIntroComponent extends TrackedTaskComponent implements OnInit, OnDestroy {
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private applicationService: ApplicationService,
        private tracker: TrackerService
    ) { super(router, applicationService, tracker);}

    ngOnInit() {
        super.ngOnInit();
    }

    initialise(): void {
        console.info(`Initialise: Active: ${this.tracker.applicationTasks.activeTask.name}`);
        this.sequenceTitle = this.tracker.activeTask.sequence.title;
        this.title = this.tracker.activeTask.title;

        let ti: TaskIntro = this.tracker.taskIntroByTask(this.tracker.activeTask);
        this.bodyText = ti.bodyText;
        this.imageUrl = ti.image;
    }

    ngOnDestroy() {}

    sequenceTitle: string;
    title: string;
    bodyText: string;
    imageUrl: string;
}