import { Task } from './task';
import { TaskStep, TaskStepStatus } from './task-step';

import { ITaskProvider } from './task-provider';

export class ApplicationTasks {

    /** 
     * Get the next valid item for the user to attend to
     */
    public getNextItem() { 
        // If there is no currentTask, we probably need one
        if( !this.currentTask ) {
            this.currentTask = this.getFirstMatchingTask();
        }

        // If there is a currentTask, where are we at?
        // Do we move on to the next page, or have we finished
        switch(this.provider.nextStepStatus( this.currentTask )) {
            // Only possible if we've just got a matching task
            case TaskStepStatus.Intro: 
                break;
            // We're still working through whatever process this is
            case TaskStepStatus.Stepping:
                break;
            // We're about to finish -- our job is to redirect to the
            // appropriate page
            case TaskStepStatus.Outro:
                break;
        }
    }

    /**
     * Get the first matching task. If there is a priority override,
     * then that is the one to use
     * @TODO - Copy business rule logic
     */
    private getFirstMatchingTask() : Task {
        let t: Task;

        // Which task list should we be using?
        let candidates = this.overrideTasks ? this.overrideTasks.slice(0) : this.tasks.slice(0);

        // Find the first valid item in the candidate array
        t = candidates.find( t => t.isValid() );
        t.newlyAssigned = true;

        return t;
    }

    tasks: Array<Task> = new Array<Task>();
    overrideTasks: Array<Task>;

    private currentTask: Task;

    constructor( private id: number, private provider: ITaskProvider ) {}
}
