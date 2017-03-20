import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';

import { ITaskProvider } from './task-provider';
import { ITaskRouterProvider } from './task-router-provider';

import { ApplicationTasks } from './application-tasks';

import { Sequence } from './sequence';
import { Task, TaskIntroTemplate, TaskOutroTemplate, TaskStatus } from './task';
import { TaskIntro } from './task-intro';
import { TaskOutro } from './task-outro';

@Injectable()
export class TrackerService implements ITaskRouterProvider {
    /**
     * Initialise. Call from application bootstrap
     */
    public initialise(): void {
        this.applicationTasks = this.getTasks();
        if( !this.applicationTasks )
            throw new Error("No tasks loaded for the current application!");

        // Okay, we must iterate through the tasks and determine which one
        // is incomplete and which conforms to the expected business rules.
        // This will be our next task, so once the homepage 'next' button
        // is called, this will become the task to route to.
        this.applicationTasks.getNextTask();

        // // If we have a page already, we probably want to set that to the
        // // active task
        // console.info( `We are initialising here: ${window.location.pathname}`);

        // this.applicationTasks.activeTask = this.taskByPathName(window.location.pathname);

        // console.info( `Active task by path is: ${this.applicationTasks.activeTask.name}`);
    }

    /**
     * Register a task status provider
     * @param provider (ITaskProvider) - who can tell us about this task and its steps
     */
    public registerTaskProvider(provider: ITaskProvider) {
        this.taskProvider = provider;
    }

    /**
     * Unregister an existing task status provider
     * @param provider (ITaskProvider) the provider to remove
     */
    public unregisterTaskProvider(provider: ITaskProvider) {
        if( this.taskProvider === provider ) {
            this.taskProvider = null;
        }
    }

    /**
     * Get the current process complete percentage
     */
    public currentProcessCompletePercent(): number {
        let p: number = 0;

        if( this.taskProvider ) {
            p = this.taskProvider.currentProcessCompletePercent();
        } else {
            if( this.applicationTasks && this.applicationTasks.activeTask ) {
                let t = this.applicationTasks.activeTask;

                let total: number;
                let step: number = 1;
                let stepModifier: number = 0;
                if( t.introTemplate !== TaskIntroTemplate.None ) stepModifier++;
                if( t.outroTemplate !== TaskOutroTemplate.None ) stepModifier++;

                total = t.totalSteps + stepModifier;

                if( t.taskStatus == TaskStatus.Intro ) step = 1;
                else if( t.taskStatus == TaskStatus.Outro || t.taskStatus == TaskStatus.Complete ) step = total;
                else {
                    step = t.currentStep + 1;
                }

                p = step / total * 100;
                console.info(`Percent: ${p}, from ${t.currentStep} or ${step} and ${t.totalSteps} with modifier ${stepModifier}`);
            }
        }

        return p;
    }

    public get canStepPrevious(): boolean {

        if( this.taskProvider ) return this.taskProvider.previousEnabled();

        if( this.applicationTasks.activeTask ) {
            switch( this.applicationTasks.activeTask.taskStatus ) {
                case TaskStatus.Intro:
                    return false;
                case TaskStatus.Outro:
                    return true;
                case TaskStatus.Stepping:
                    if ( this.applicationTasks.activeTask.introTemplate != TaskIntroTemplate.None )
                        return true;
            }
        }

        return false;
    }

    public get canStepNext(): boolean {
        if( this.taskProvider ) return this.taskProvider.nextEnabled();

        if( this.applicationTasks.activeTask ) {
            switch( this.applicationTasks.activeTask.taskStatus ) {
                case TaskStatus.Intro:
                    return true;
                case TaskStatus.Outro:
                    return true;
                case TaskStatus.Stepping:
                    return this.applicationTasks.activeTask.isValid;
            }            
        }

        return true;
    }

    /**
     * Step to the next step in the sequence
     */
    public next(): boolean {
        this.applicationTasks.getNextItem(this);

        return false;
    }

    /** 
     * Step to the previous step in the sequence
     */
    public previous(): boolean {
        this.applicationTasks.getPreviousItem(this);

        return false;
    }

    /**
     * Get the active task
     */
    public get activeTask(): Task {
        if( !this.applicationTasks )
            throw new Error("No tasks loaded for the current application!");

        console.debug(`getting activeTask`);

        return this.applicationTasks.activeTask;
    }

    /**
     * Navigate to the desired task's URL
     * @param task (Task) - the task to navigate to
     * @param currentDirection (number) - what to increment the step by if necessary
     */
    public navigateToTaskUrl( task: Task, currentDirection: number ): boolean {
        let url : string;

        switch( task.taskStatus ) {

            case TaskStatus.Intro: 
                switch( task.introTemplate ) {
                    case TaskIntroTemplate.Default:
                    default:
                        task.currentStep = 0;
                        url = `${task.routerUrl}/intro`;
                        break;
                }
                break;
            case TaskStatus.Stepping:
                task.currentStep += currentDirection;
                console.log(`Current Step is ${task.currentStep}`);
                url = task.routerUrl;
                if( task.routes.length > 0)
                    url = task.routes[task.currentStep - 1];
                break;
            case TaskStatus.Outro: 
                switch( task.outroTemplate ) {
                    case TaskOutroTemplate.Default:
                    default:
                        task.currentStep = task.totalSteps + 1;
                        url = `${task.routerUrl}/finished`;
                        break;
                }
                break;
        }

        console.info(`Navigate to ${url}`);

        this.router.navigate( [url], {} );
        return false;
    }

    /**
     * Get a task based on its routerUrl, from either of the candidate task pools.
     * @param pathName (string) - the path name (from window.location.pathname) to search for
     */
    public taskByPathName( pathName: string ) : Task {        
        let t: Task = this.taskFromListByPathName( this.applicationTasks.tasks, pathName );

        if( !t && this.applicationTasks.overrideTasks ) {
            let t: Task = this.taskFromListByPathName( this.applicationTasks.overrideTasks, pathName );
        }

        return t;
    }

    /**
     * Find the task intro by task
     * @param task (Task) - current task
     */
    public taskIntroByTask( task: Task ) : TaskIntro {
        if(!this.taskIntros) {
            this.taskIntros = this.getTaskIntros(this.applicationTasks);
        }

        return this.taskIntros.find(ti => ti.task == task);
    }

    /**
     * Find the task outro by task
     * @param task (Task) - current task
     */
    public taskOutroByTask( task: Task ) : TaskOutro {
        if( !this.taskOutros ) {
            this.taskOutros = this.getTaskOutros(this.applicationTasks);
        }

        return this.taskOutros.find(ti => ti.task == task);
    }


    /**
     * Set the active task
     * @param t (Task) - the task to make active
     */
    public setActiveTask( t: Task ) {
        console.log(`Setting active task to ${t.name}`);
        if( this.applicationTasks.activeTask !== t ) {
            this.applicationTasks.activeTask = t;
        }
    }

    public applicationTasks: ApplicationTasks;

    /**
     * Constructor
     * @param http (Http) - http service
     * @param router (Router) - router service
     */
    constructor( 
        private http: Http, 
        private router: Router 
    ) {
        console.debug("TrackerService::ctor");
     }

    /**
     * Load sequences
     */
    private getSequences(): Array<Sequence> {
        let s = new Array<Sequence>();

        s.push( new Sequence( { id: 1, name: 'PrepareForInterview', title: 'Prepare for Interview'} ) );

        return s;
    }

    /**
     * Call the tracker service to get tasks.
     * 
     * NOTE: the service should either return the tasks by priority, or
     * we should use extra information about the current application
     * in order to determine which item takes precedent...
     * @param id (number) - application id
     */ 
    private getTasks() : ApplicationTasks {
        let t = new ApplicationTasks();

        // Load tasks and override tasks from the service
        t.tasks.push( new Task( { sequence: this.getSequenceById(1), id: 1, name: "CreateApplication", title: "Create Application", 
            routerUrl: "/application/create", 
            routes: ["/application/create", "/application/create/step2"],
            totalSteps: 2, introTemplate: TaskIntroTemplate.Default, outroTemplate: TaskOutroTemplate.Default } ) )
        t.tasks.push( new Task( { sequence: this.getSequenceById(1), id: 2, name: "FirstForm", title: "A form",
            routerUrl: '/form/this-is-my-form',
            totalSteps: 9, introTemplate: TaskIntroTemplate.Default, outroTemplate: TaskOutroTemplate.Default } ) )
        t.tasks.push( new Task( { sequence: this.getSequenceById(1),id: 4, name: "SelectInterviewer", title: "Select your Interviewer" } ) )
        t.tasks.push( new Task( { sequence: this.getSequenceById(1),id: 5, name: "MoreInformation", title: "More Information" } ) )

        return t;
    }

    /**
     * Get task introductory steps
     * @param tasks (ApplicationTasks) - task list
     */
    private getTaskIntros( tasks: ApplicationTasks ) : Array<TaskIntro> {
        let i: Array<TaskIntro> = new Array<TaskIntro>();
        
        console.info(`Loading task intros`);

        i.push( new TaskIntro( 
            { 
                task: this.getTaskById(tasks, 1), 
                bodyText: 'Before your interview, we\'d like you to think about a few things... like which types of camp you\'d like to work on, which activities you\'d like to be involved in and other experiences which may be relevant!',
                image: 'img/sequence/sign-1.png' 
            }) );

        i.push( new TaskIntro( 
            { 
                task: this.getTaskById(tasks, 2), 
                bodyText: 'This is some text about going on to do some form work, to test out the metaform. Let\'s hope it works!',
                image: 'img/sequence/database.png' 
            }) );
        return i;
    }

    /**
     * Get task reward pages
     * @param tasks (ApplicationTask) - task list
     */
    private getTaskOutros( tasks: ApplicationTasks ) : Array<TaskIntro> {
        let i: Array<TaskOutro> = new Array<TaskOutro>();
        
        console.info(`Loading task outros`);

        let createApplicationTask = this.getTaskById(tasks, 1);

        i.push( new TaskOutro( 
            { 
                task: this.getTaskById(tasks, 1), 
                bodyText: 'Congratulations on completing the create application task!',
            }) );
        i.push( new TaskOutro( 
            { 
                task: this.getTaskById(tasks, 2), 
                bodyText: 'Congratulations on completing the metaform task!',
                image: 'img/sequence/like.png'
            }) );

        return i;
    }

    /**
     * Get a task based on browsers pathname
     * @param tasks (Array of Tasks) - candidate tasks
     * @param pathName (string) - url pathname segment
     */
    private taskFromListByPathName( tasks: Array<Task>, pathName: string ) : Task {
        let t: Task = tasks.find( t => t.routerUrl === pathName );
        if( !t ) {
            // If may be we need to check the lower levels
            for(let i=0;i<tasks.length; i++){
                if( tasks[i].routes.length > 0) {
                    for(let r=0;r<tasks[i].routes.length;r++){
                        if(tasks[i].routes[r] === pathName) {
                            t = tasks[i];
                            return t;
                        }
                    }
                }
            }
        }

        return t;
    }

    /**
     * Return a sequence by Id
     * @param id (number) - sequence Id to find
     */
    private getSequenceById(id: number) {
        if( !this.sequences ) {
            this.sequences = this.getSequences();
        }

        return this.sequences.find( s => s.id === id );
    }

    /**
     * Return a task from the pool of standard or override priority 
     * tasks, based on passed Id.
     * @param applicationTasks (ApplicationTasks) - the tasks to search within
     * @param id (number) - task Id to search for
     */
    private getTaskById(applicationTasks: ApplicationTasks, id: number): Task {
        let t: Task = applicationTasks.tasks.find( t => t.id === id );
        if( !t ) {
            t = applicationTasks.overrideTasks.find( t => t.id === id );
        }

        return t;
    }

    private taskProvider: ITaskProvider;

    private sequences: Array<Sequence>;
    private taskIntros: Array<TaskIntro>;
    private taskOutros: Array<TaskOutro>;
}
