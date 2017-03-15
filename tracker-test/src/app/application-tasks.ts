import { Task } from './task';
import { TaskStep, TaskStepStatus } from './task-step';

import { ITaskProvider } from './task-provider';

export class ApplicationTasks {

    public get activeTask(): Task { return this.currentTask };
    
    public getNextTask() {
        let t: Task = this.getFirstMatchingTask();
        
        this.nextTaskInQueue = t;
        console.debug(`Got next task in queue '${t.name}'`);
    }

    /** 
     * Get the next valid item for the user to attend to
     */
    public getNextItem( provider: ITaskProvider ) { 
        // If there is no currentTask, we probably need one
        if( !this.currentTask ) {
            console.debug(`No current task, finding the first`);
            this.currentTask = this.getFirstMatchingTask();
            console.debug(`Got task '${this.currentTask.name}'`);
        }

        console.debug(`The next step status for this task is ${provider.nextStepStatus( this.currentTask )}`);

        // If there is a currentTask, where are we at?
        // Do we move on to the next page, or have we finished
        switch(provider.nextStepStatus( this.currentTask )) {
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

        if( candidates.length > 0 ) {
            console.debug(`Got ${candidates.length} candidate tasks`);

            // Find the first valid item in the candidate array
            t = candidates.find( t => t.isValid() );
            t.newlyAssigned = true;
        } else {
            throw new Error("No tasks to find a match for!");
        }
    
        return t;
    }

    tasks: Array<Task> = new Array<Task>();
    overrideTasks: Array<Task>;

    public nextTaskInQueue: Task;
    private currentTask: Task;

    //constructor( private id: number, private provider: ITaskProvider ) {}
    constructor() {}
}
