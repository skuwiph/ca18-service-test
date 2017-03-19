import { Task, TaskStatus } from './task';

import { ITaskProvider } from './task-provider';
import { ITaskRouterProvider } from './task-router-provider';

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
    public getNextItem( routerProvider: ITaskRouterProvider ) { 
        // If there is no currentTask, we probably need one
        if( !this.currentTask ) {
            console.debug(`No current task, finding the active task`);
            //this.currentTask = this.getFirstMatchingTask();
            this.currentTask = this.nextTaskInQueue;
            this.currentTask.taskStatus = TaskStatus.Intro;

            console.debug(`Got task '${this.currentTask.name}'`);
        } else {
            // We have a currentTask, proceed to the next step
            switch(this.currentTask.taskStatus)
            {
                case TaskStatus.Intro:
                    this.currentTask.taskStatus = TaskStatus.Stepping;
                    break;
                case TaskStatus.Stepping:
                    
                    break;
                case TaskStatus.Outro:
                    this.currentTask.complete = true;
                    this.getNextTask();
                    break;
            }
        }



        // redirect to the current task's url
        routerProvider.navigateToTaskUrl(this.currentTask);
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
            t = candidates.find( t => t.isValid() && !t.complete );
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
