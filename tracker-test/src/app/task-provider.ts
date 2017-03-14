import { Task } from './task';
import { TaskStep, TaskStepStatus } from './task-step';

export interface ITaskProvider {
    nextEnabled(): boolean;
    previousEnabled(): boolean;

    // NOTE(Ian): If currentTask.newlyAssigned then we have just started
    // work on this task and must return TaskStepStatus.Intro...
    nextStepStatus( currentTask: Task ): TaskStepStatus;

    // 
    previousStepStatus( currentTask: Task ): TaskStepStatus;
}