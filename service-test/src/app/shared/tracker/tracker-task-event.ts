import { Task } from './task';

export class TrackerTaskEvent {
    activeTask: Task;
    currentStep: number;
    totalSteps: number;
    percentComplete: number;

    constructor( options: {
        activeTask?: Task,
        currentStep?: number,
        totalSteps?: number,
        percentComplete?: number
     }) {
         this.activeTask = options.activeTask;
         this.currentStep = options.currentStep;
         this.totalSteps = options.totalSteps;
         this.percentComplete = options.percentComplete;
     }
}
