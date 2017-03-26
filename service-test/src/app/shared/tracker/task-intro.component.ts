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
    ) { super(router, tracker);}

    ngOnInit() {
        super.ngOnInit();
        this.tracker.calculateCurrentProgress();
    }

    ngOnDestroy() {}

    initialise(): void {
        console.info(`Initialise: Active: ${this.tracker.applicationTasks.currentTask.name}`);
        this.sequenceTitle = this.tracker.getActiveSequence().title;
        this.title = this.tracker.activeTask.title;

        let ti: TaskIntro = this.tracker.taskIntroByTask(this.tracker.activeTask);
        this.bodyText = ti.bodyText;
        this.imageUrl = ti.image;
    }

    sequenceTitle: string;
    title: string;
    bodyText: string;
    imageUrl: string;
}