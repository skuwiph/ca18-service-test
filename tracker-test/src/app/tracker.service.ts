import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { ITaskProvider } from './task-provider';

import { ApplicationTasks } from './application-tasks';
import { Task } from './task';
import { TaskStep } from './task-step';

@Injectable()
export class TrackerService {
    /**
     * Initialise. Call from application bootstrap
     */
    public initialise() : Task {
        console.debug(`Getting First Task`);

        this.applicationTasks = this.getTasks();

        if( !this.applicationTasks )
            throw new Error("No tasks loaded for the current application!");

        // Okay, we must iterate through the tasks and determine which one
        // is incomplete and which conforms to the expected business rules.
        // This will be our next task, so once the homepage 'next' button
        // is called, this will become the task to route to.
        this.applicationTasks.getNextTask();

        return this.applicationTasks.nextTaskInQueue;
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
     * Step to the next step in the sequence
     */
    public next() : void {
        if( !this.applicationTasks )
            throw new Error("No tasks loaded for the current application!");

        if( !this.taskProvider )
            throw new Error("No task status provider registered!");

        this.applicationTasks.getNextItem(this.taskProvider);
    }


    public applicationTasks: ApplicationTasks;

    constructor( private http: Http ) { }

    /**
     * Call the tracker service to get tasks 
     * @param id (number) - application id
     */ 
    private getTasks() : ApplicationTasks {
        let t = new ApplicationTasks();

        console.debug(`Loading tasks for all applications`);

        // Load tasks and override tasks from the service
        t.tasks.push( new Task( { id: 1, name: "CreateApplication" } ) )
        t.tasks.push( new Task( { id: 2, name: "PrepareForInterview" } ) )
        t.tasks.push( new Task( { id: 3, name: "SkillsFirstPass" } ) )
        t.tasks.push( new Task( { id: 4, name: "SelectInterviewer" } ) )
        t.tasks.push( new Task( { id: 5, name: "MoreInformation" } ) )

        return t;
    }

    /**
     * Return a task from the pool of standard or override priority 
     * tasks, based on passed Id.
     * @param applicationTasks (ApplicationTasks) - the tasks to search within
     * @param id (number) - task Id to search for
     */
    private getTaskById(applicationTasks: ApplicationTasks, id: number): Task {
        let t: Task = applicationTasks.tasks.find( t => t.id == id );
        if( !t ) {
            t = applicationTasks.overrideTasks.find( t => t.id == id );
        }

        return t;
    }

    private taskProvider: ITaskProvider;
}
