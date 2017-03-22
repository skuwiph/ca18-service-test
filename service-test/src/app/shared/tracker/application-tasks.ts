import { Task, TaskStatus, TaskIntroTemplate, TaskOutroTemplate } from './task';

import { ITaskProvider } from './task-provider';
import { ITaskRouterProvider } from './task-router-provider';

export class ApplicationTasks {

    public getNextTask() {
        let t: Task = this.getFirstMatchingTask();
        
        this.nextTaskInQueue = t;
        console.debug(`Got next task in queue '${t.name}', status ${t.taskStatus}`);
    }

    /** 
     * Get the next valid item for the user to attend to
     */
    public getNextItem( routerProvider: ITaskRouterProvider ) { 
        let lastStatus;

        // If there is no currentTask, we probably need one
        if( !this.currentTask ) {
            this.currentTask = this.nextTaskInQueue;
            this.currentTask.taskStatus = TaskStatus.Intro;
            //console.debug(`Got task '${this.currentTask.name}' with status ${this.currentTask.taskStatus}`);
        } else {
            //console.info(`Got current task ${this.currentTask.name} with status ${this.currentTask.taskStatus}`);
            lastStatus = this.currentTask.taskStatus;

            // We have a currentTask, proceed to the next step
            switch(this.currentTask.taskStatus)
            {
                case TaskStatus.Intro:
                    this.currentTask.taskStatus = TaskStatus.Stepping;
                    break;
                case TaskStatus.Stepping:
                    if( this.currentTask.currentStep == this.currentTask.totalSteps )                     {
                        if( this.currentTask.outroTemplate === TaskOutroTemplate.None ) {
                            console.log("We are complete with no outro");
                            this.completeCurrentTask();
                        } else {
                            console.log("We are complete, head to outro");
                            this.currentTask.taskStatus = TaskStatus.Outro;
                        }
                    }
                    break;
                case TaskStatus.Outro:
                    this.completeCurrentTask();
                    break;
            }
        }

        // redirect to the current task's url
        routerProvider.navigateToTaskUrl(this.currentTask, ApplicationTasks.DIRECTION_FORWARDS, lastStatus);
    }

    /**
     * Get the previous valid item where possible
     * @param routerProvider (ITaskRouterProvider) - router provider
     */
    public getPreviousItem( routerProvider: ITaskRouterProvider ) {
        if( !this.currentTask ) {
            return;
        }

        let lastStatus = this.currentTask.taskStatus;

        switch(this.currentTask.taskStatus)
        {
            case TaskStatus.Intro:
                // TODO: Check previous task in this list to see whether we can't step backwards?
                return;
            case TaskStatus.Stepping:
                if( this.currentTask.currentStep === 1 ) {
                    this.currentTask.taskStatus = TaskStatus.Intro;
                }
                break;
            case TaskStatus.Outro:
                this.currentTask.currentStep = this.currentTask.totalSteps + 1; // because we subtract one from it
                this.currentTask.taskStatus = TaskStatus.Stepping;
                break;
        }

        // redirect to the current task's url
        routerProvider.navigateToTaskUrl(this.currentTask, ApplicationTasks.DIRECTION_BACKWARDS, lastStatus);
    }

    /**
     * Get currently active task - may be undefined or null!
     */
    public get activeTask(): Task { return this.currentTask; }
    
    /**
     * Set currently active task
     */
    public set activeTask( t: Task ) { this.currentTask = t; }

    /**
     * Complete the current task
     */
    private completeCurrentTask(): void {
        console.info(`Completing task ${this.currentTask.name}`);
        this.currentTask.taskStatus = TaskStatus.Complete;
        this.currentTask.complete = true;

        // TODO: Update server

        this.getNextTask();

        // Ensure the next task is the correct one!
        this.currentTask = this.nextTaskInQueue;

        console.info(`Got new current task: ${this.currentTask.name}`);
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
            t = candidates.find( t => t.validForRules() && !t.complete );
            
            t.taskStatus = t.introTemplate != TaskIntroTemplate.None ? TaskStatus.Intro : TaskStatus.Stepping;
        } else {
            throw new Error("No tasks to find a match for!");
        }
    
        return t;
    }

    public nextTaskInQueue: Task;
    
    tasks: Array<Task> = new Array<Task>();
    overrideTasks: Array<Task>;

    private currentTask: Task;
    
    public static readonly DIRECTION_FORWARDS: number = +1;
    public static readonly DIRECTION_BACKWARDS: number = -1;

    //constructor( private id: number, private provider: ITaskProvider ) {}
    constructor() {}
}
