import { Component, OnInit } from '@angular/core';

import { TrackerService } from './tracker.service';
import { ITaskProvider } from './task-provider';
import { Task } from './task';
import { TaskStepStatus } from './task-step';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit { //, ITaskProvider {
    title = 'app works!';

    constructor(private tracker: TrackerService ) {}

    ngOnInit() {
        console.info(`In AppComponent`);
    }

    nextEnabled(): boolean { return true;}
    previousEnabled(): boolean { return true;}

//     // NOTE(Ian): If currentTask.newlyAssigned then we have just started
//     // work on this task and must return TaskStepStatus.Intro...
//     nextStepStatus( currentTask: Task ): TaskStepStatus {
//         return TaskStepStatus.Intro;
//     }

//     // 
//     previousStepStatus( currentTask: Task ): TaskStepStatus {
//         return TaskStepStatus.Intro;
//     }
}
