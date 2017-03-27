import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';

import {Observable} from 'rxjs/Rx';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import 'rxjs/add/observable/forkJoin';

import { ITaskProvider } from './task-provider';
import { ITaskRouterProvider } from './task-router-provider';

import { ApplicationTasks } from './application-tasks';

import { Sequence } from './sequence';
import { Task, TaskIntroTemplate, TaskOutroTemplate, TaskStatus, TaskType } from './task';
import { TaskIntro } from './task-intro';
import { TaskOutro } from './task-outro';
import { TrackerEvent, TrackerEventType } from './tracker-event';
import { TrackerTaskEvent } from './tracker-task-event';

import { BusinessRuleService } from '../rule/business-rule.service';
import { IBusinessRuleData } from '../rule/business-rule';


@Injectable()
export class TrackerService implements ITaskRouterProvider {
    /**
     * Initialise. Call from application bootstrap
     */
    public initialise(): void {
        this.updateSendEvent(TrackerEventType.Initialising);

        this.loadTrackerData();

        // // If we have a page already, we probably want to set that to the
        // // active task
        // console.info( `We are initialising here: ${window.location.pathname}`);
        // let t: Task = this.taskByPathName(window.location.pathname);

        // if( t ) {
        //     this.applicationTasks.currentTask = t;

        //     if( this.applicationTasks )
        //         console.info( `Active task by path is: ${this.applicationTasks.currentTask.name}`);
        // }

        this.rules.getCurrentRules();

        // For safety during development, let's force a redirect to homepage
        this.router.navigateByUrl('/home');
    }
    
    public loadTrackerData() {
        Observable.forkJoin(
            this.http.get('/app/data/tracker/sequences.json')
                .map((res) => res.json()),
            this.http.get('/app/data/tracker/tasks.json')
                .map((res) => res.json()),
            this.http.get('/app/data/tracker/intros.json')
                .map((res) => res.json()),
            this.http.get('/app/data/tracker/outros.json')
                .map((res) => res.json())
        ).subscribe(
        data => {
            this.applicationTasks = new ApplicationTasks();
            this.sequences = <Array<Sequence>>(data[0]);
            this.applicationTasks.tasks = <Array<Task>>(data[1]);
            this.taskIntros = <Array<TaskIntro>>(data[2]);
            this.taskOutros = <Array<TaskOutro>>(data[3]);;

            this.updateSendEvent( TrackerEventType.TasksLoaded );

            // Okay, we must iterate through the tasks and determine which one
            // is incomplete and which conforms to the expected business rules.
            // This will be our next task, so once the homepage 'next' button
            // is called, this will become the task to route to.
            this.getNextTask(this.applicationTasks);
        },
        err => console.error(err)
        );
    }

    /**
     * Esnure we load the task completion statistics for the user
     * @param applicationId (number) - user's applicationId
     */
    public loadTasksForApplication(applicationId: number) {
        // This should also load any override tasks
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
     * NOTE: this calls out to any registered taskProvider.
     * SIDE-EFFECT: this will emit an event on the TrackerTaskEventStream$
     */
    public calculateCurrentProgress(): void {
        let p: number = 0;
        if( this.taskProvider ) {
            let result = this.taskProvider.currentProcessCompletePercent();
            p = result[0];
            this.currentStep = result[1];
            this.totalSteps = result[2];
        } else {
            if( this.applicationTasks && this.applicationTasks.currentTask ) {
                let t = this.applicationTasks.currentTask;

                this.currentStep = 0;
                let stepModifier: number = 0;
                if( t.introTemplate !== TaskIntroTemplate.None ) stepModifier++;
                if( t.outroTemplate !== TaskOutroTemplate.None ) stepModifier++;

                this.totalSteps = t.totalSteps + stepModifier;

                if( t.taskStatus == TaskStatus.Intro ) {
                    this.currentStep  = 0;
                } else if( t.taskStatus == TaskStatus.Outro || t.taskStatus == TaskStatus.Complete ) {
                    this.currentStep  = this.totalSteps;
                } else {
                    this.currentStep = t.currentStep + 1;
                }

                p = this.currentStep / this.totalSteps * 100;
            }
        }

        this.currentPercentComplete = p;
        this.updateCurrentStatus();
    }

    /**
     * Can we go backwards
     * NOTE: Calls out to any registered taskProvider
     * NOTE: Probably incomplete implementation
     */
    public get canStepPrevious(): boolean {

        if( this.taskProvider ) return this.taskProvider.previousEnabled();

        if( this.applicationTasks.currentTask ) {
            switch( this.applicationTasks.currentTask.taskStatus ) {
                case TaskStatus.Intro:
                    return false;
                case TaskStatus.Outro:
                    return true;
                case TaskStatus.Stepping:
                    if ( this.applicationTasks.currentTask.introTemplate != TaskIntroTemplate.None )
                        return true;
            }
        }

        return false;
    }

    /**
     * Can we go forwards?
     * NOTE: Calls out to any registered taskProvider
     * NOTE: Probably incomplete implementation
     */
    public get canStepNext(): boolean {
        if( this.taskProvider ) return this.taskProvider.nextEnabled();

        if( this.applicationTasks.currentTask ) {
            switch( this.applicationTasks.currentTask.taskStatus ) {
                case TaskStatus.Intro:
                    return true;
                case TaskStatus.Outro:
                    return true;
                case TaskStatus.Stepping:
                    return this.applicationTasks.currentTask.isValid;
            }            
        }

        return true;
    }

    /**
     * Step to the next step in the sequence
     */
    public next(): boolean {
        let t: Task = this.applicationTasks.currentTask;
        this.getNextItem(this.applicationTasks, this);
        if( t !== this.applicationTasks.currentTask ) {
            this.updateSendEvent( TrackerEventType.ActiveTaskChanged );
        }
        return false;
    }

    /** 
     * Step to the previous step in the sequence
     */
    public previous(): boolean {
        let t: Task = this.applicationTasks.currentTask;
        this.getPreviousItem(this.applicationTasks, this);
        if( t !== this.applicationTasks.currentTask ) {
            this.updateSendEvent( TrackerEventType.ActiveTaskChanged );
        }

        return false;
    }

    /**
     * Get the active task
     */
    public get activeTask(): Task {
        if( !this.applicationTasks )
            throw new Error("No tasks loaded for the current application!");

        return this.applicationTasks.currentTask;
    }

    /** 
     * Get the active task's sequence
     */
    public getActiveSequence(): Sequence {
        if( this.activeTask ) {
            let sequenceId = this.activeTask.sequenceId;
            return this.sequences.find( s => s.id == sequenceId );
        }

        return null;
    }

    /**
     * Navigate to the desired task's URL
     * @param task (Task) - the task to navigate to
     * @param currentDirection (number) - what to increment the step by if necessary
     * @param lastStatus (TaskStatus) - the last status of this task prior to any movement
     */
    public navigateToTaskUrl( task: Task, currentDirection: number, lastStatus: TaskStatus ): boolean {
        let url : string;
        let params;

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
                if( this.taskProvider ) {
                    if( (currentDirection == ApplicationTasks.DIRECTION_FORWARDS && this.taskProvider.stepNext())
                    ||  (currentDirection == ApplicationTasks.DIRECTION_BACKWARDS && this.taskProvider.stepPrevious())
                     ) {
                        // early exit
                        this.calculateCurrentProgress();                        
                        return;
                    }
                }

                url = task.routerUrl;
                if( task.routes.length > 0) {
                    url = task.routes[task.currentStep - 1];
                }

                if (task.taskType == TaskType.Metaform
                && currentDirection == ApplicationTasks.DIRECTION_BACKWARDS 
                && lastStatus == TaskStatus.Outro) {
                    params = { f: 'l' };
                }
                break;
            case TaskStatus.Outro: 
                switch( task.outroTemplate ) {
                    case TaskOutroTemplate.Default:
                    default:
                        task.currentStep = task.totalSteps + 1;
                        this.currentStep = this.totalSteps;
                        url = `${task.routerUrl}/finished`;
                        break;
                }
                break;
        }
        
        this.calculateCurrentProgress();

        if( !url ) {
            throw new Error(`For task ${task.id}, the target Url was undefined!`);
        }

        console.info(`Navigate to ${url}`);
        if( params ) { console.info(`params: ${params.f}`); }

        this.router.navigate( [url], { queryParams: params } );
        return false;
    }

    /**
     * Get a task based on its routerUrl, from either of the candidate task pools.
     * @param pathName (string) - the path name (from window.location.pathname) to search for. This MUST be URIdecoded
     */
    public taskByPathName( pathName: string ) : Task {        
        let searchPath = pathName.split('&')[0]; // avoid any 'params' -- 

        console.info(`finding path ${searchPath}`);

        let t: Task = this.taskFromListByPathName( this.applicationTasks.tasks, searchPath );

        if( !t && this.applicationTasks.overrideTasks ) {
            let t: Task = this.taskFromListByPathName( this.applicationTasks.overrideTasks, searchPath );
        }

        return t;
    }

    /**
     * Find the task intro by task
     * @param task (Task) - current task
     */
    public taskIntroByTask( task: Task ): TaskIntro {
        if(!this.taskIntros) {
            this.taskIntros = this.getTaskIntros(this.applicationTasks);
        }

        console.info(`Got ${this.taskIntros.length} task Intros. Looking for taskId ${task.id}`);

        this.taskIntros.forEach( ti => console.info(`TI: ${ti.image}, ${ti.taskId}`));

        return this.taskIntros.find(ti => ti.taskId == task.id);
    }

    /**
     * Find the task outro by task
     * @param task (Task) - current task
     */
    public taskOutroByTask( task: Task ): TaskOutro {
        if( !this.taskOutros ) {
            this.taskOutros = this.getTaskOutros(this.applicationTasks);
        }

        return this.taskOutros.find(ti => ti.taskId == task.id);
    }

    /**
     * Set the active task
     * @param t (Task) - the task to make active
     */
    public setActiveTask( t: Task ) {
        console.log(`Setting active task to ${t.name}`);
        if( this.applicationTasks.currentTask !== t ) {
            this.applicationTasks.currentTask = t;
        }
    }

    public applicationTasks: ApplicationTasks = new ApplicationTasks();

    /**
     * Constructor
     * @param http (Http) - http service
     * @param router (Router) - router service
     */
    constructor ( 
        private http: Http, 
        private router: Router,
        private rules: BusinessRuleService
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
        t.tasks.push( new Task( { sequenceId: 1, id: 1, name: "CreateApplication", title: "Create Application", 
            routerUrl: "/application/create", 
            routes: ["/application/create", "/application/create/step2"],
            totalSteps: 2, introTemplate: TaskIntroTemplate.Default, outroTemplate: TaskOutroTemplate.Default,
            complete: false } ) )
        t.tasks.push( new Task( { sequenceId: 1, id: 2, name: "FirstForm", title: "A form",
            taskType: TaskType.Metaform,
            routerUrl: '/form/this-is-my-form',
            totalSteps: 9, introTemplate: TaskIntroTemplate.Default, outroTemplate: TaskOutroTemplate.Default } ) )
        t.tasks.push( new Task( { sequenceId: 1, id: 4, name: "SelectInterviewer", title: "Select your Interviewer" } ) )
        t.tasks.push( new Task( { sequenceId: 1, id: 5, name: "MoreInformation", title: "More Information" } ) )

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
                taskId: 1, 
                bodyText: 'Before your interview, we\'d like you to think about a few things... like which types of camp you\'d like to work on, which activities you\'d like to be involved in and other experiences which may be relevant!',
                image: 'img/sequence/sign-1.png' 
            }) );

        i.push( new TaskIntro( 
            { 
                taskId: 2,
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
                taskId: 1,
                bodyText: 'Congratulations on completing the create application task!',
            }) );
        i.push( new TaskOutro( 
            { 
                taskId: 2,
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

    /** Stripped out from applicationTasks */

   public getNextTask(applicationTasks: ApplicationTasks) {
        let t: Task = this.getFirstMatchingTask(applicationTasks);
        
        applicationTasks.nextTaskInQueue = t;
        console.debug(`Got next task in queue '${t.name}', status ${t.taskStatus}`);
    }

    /** 
     * Get the next valid item for the user to attend to
     */
    public getNextItem( applicationTasks: ApplicationTasks, routerProvider: ITaskRouterProvider ) { 
        let lastStatus;
        
        // If there is no currentTask, we probably need one
        if( !applicationTasks.currentTask ) {
            applicationTasks.currentTask = applicationTasks.nextTaskInQueue;
            applicationTasks.currentTask.taskStatus = TaskStatus.Intro;
            //console.debug(`Got task '${this.currentTask.name}' with status ${this.currentTask.taskStatus}`);
        } else {
            //console.info(`Got current task ${this.currentTask.name} with status ${this.currentTask.taskStatus}`);
            lastStatus = applicationTasks.currentTask.taskStatus;

            // We have a currentTask, proceed to the next step
            switch(applicationTasks.currentTask.taskStatus)
            {
                case TaskStatus.Intro:
                    applicationTasks.currentTask.taskStatus = TaskStatus.Stepping;
                    break;
                case TaskStatus.Stepping:
                    if( applicationTasks.currentTask.currentStep == applicationTasks.currentTask.totalSteps )                     {
                        if( applicationTasks.currentTask.outroTemplate === TaskOutroTemplate.None ) {
                            console.log("We are complete with no outro");
                            this.completeCurrentTask(applicationTasks);
                        } else {
                            console.log("We are complete, head to outro");
                            applicationTasks.currentTask.taskStatus = TaskStatus.Outro;
                        }
                    }
                    break;
                case TaskStatus.Outro:
                    this.completeCurrentTask(applicationTasks);
                    break;
            }
        }

        // redirect to the current task's url
        routerProvider.navigateToTaskUrl(applicationTasks.currentTask, ApplicationTasks.DIRECTION_FORWARDS, lastStatus);
    }

    /**
     * Get the previous valid item where possible
     * @param routerProvider (ITaskRouterProvider) - router provider
     */
    public getPreviousItem( applicationTasks: ApplicationTasks, routerProvider: ITaskRouterProvider ) {
        if( !applicationTasks.currentTask ) {
            return;
        }

        let lastStatus = applicationTasks.currentTask.taskStatus;

        switch(applicationTasks.currentTask.taskStatus)
        {
            case TaskStatus.Intro:
                // TODO: Check previous task in this list to see whether we can't step backwards?
                return;
            case TaskStatus.Stepping:
                if( applicationTasks.currentTask.currentStep === 1 ) {
                    applicationTasks.currentTask.taskStatus = TaskStatus.Intro;
                }
                break;
            case TaskStatus.Outro:
                applicationTasks.currentTask.currentStep = applicationTasks.currentTask.totalSteps + 1; // because we subtract one from it
                applicationTasks.currentTask.taskStatus = TaskStatus.Stepping;
                break;
        }

        // redirect to the current task's url
        routerProvider.navigateToTaskUrl(applicationTasks.currentTask, ApplicationTasks.DIRECTION_BACKWARDS, lastStatus);
    }

    // /**
    //  * Get currently active task - may be undefined or null!
    //  */
    // public get activeTask(): Task { return this.currentTask; }
    
    // /**
    //  * Set currently active task
    //  */
    // public set activeTask( t: Task ) { this.currentTask = t; }

    /**
     * Complete the current task
     */
    private completeCurrentTask(applicationTasks: ApplicationTasks): void {
        console.info(`Completing task ${applicationTasks.currentTask.name}`);
        applicationTasks.currentTask.taskStatus = TaskStatus.Complete;
        applicationTasks.currentTask.complete = true;

        // TODO: Update server

        this.getNextTask(applicationTasks);

        // Ensure the next task is the correct one!
        applicationTasks.currentTask = applicationTasks.nextTaskInQueue;

        console.info(`Got new current task: ${applicationTasks.currentTask.name}`);
    }

    /**
     * Get the first matching task. If there is a priority override,
     * then that is the one to use
     * @TODO - Copy business rule logic
     */
    private getFirstMatchingTask(applicationTasks: ApplicationTasks) : Task {
        let t: Task;

        // Which task list should we be using?
        let candidates = applicationTasks.overrideTasks ? applicationTasks.overrideTasks.slice(0) : applicationTasks.tasks.slice(0);

        if( candidates.length > 0 ) {
            console.debug(`Got ${candidates.length} candidate tasks`);

            // Find the first valid item in the candidate array
            t = candidates.find( t => this.taskValidForRules(t) && !t.complete );
            
            t.taskStatus = t.introTemplate != TaskIntroTemplate.None ? TaskStatus.Intro : TaskStatus.Stepping;
        } else {
            throw new Error("No tasks to find a match for!");
        }
    
        return t;
    }

    private taskValidForRules( t: Task ): boolean {
        return true;
    }

    /* End of applicationTasks migrated code */

    private updateCurrentStatus(): void {
        this._trackerTaskEventSource.next( new TrackerTaskEvent({activeTask: this.activeTask, currentStep: this.currentStep, totalSteps: this.totalSteps, percentComplete: this.currentPercentComplete}));
    }

    private updateSendEvent( event: TrackerEventType ) {
        console.debug(`TrackerService->Sending event '${event}'`);
        this._trackerEventSource.next( new TrackerEvent( event ));
    }

    // Observable event source
    private _trackerTaskEventSource = new BehaviorSubject<TrackerTaskEvent>( new TrackerTaskEvent( { percentComplete: 0 }) );

    // Observable event stream
    trackerTaskEventStream$ = this._trackerTaskEventSource.asObservable();

    private _trackerEventSource = new BehaviorSubject<TrackerEvent>( new TrackerEvent( TrackerEventType.Initialising ) );
    trackerEventStream$ = this._trackerEventSource.asObservable();


    private taskProvider: ITaskProvider;

    private sequences: Array<Sequence>;
    private taskIntros: Array<TaskIntro>;
    private taskOutros: Array<TaskOutro>;

    private totalSteps: number;
    private currentStep: number;
    private currentPercentComplete: number;
}
