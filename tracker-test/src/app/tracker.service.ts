import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { ITaskProvider } from './task-provider';

import { ApplicationTasks } from './application-tasks';
import { Task } from './task';
import { TaskStep } from './task-step';

@Injectable()
export class TrackerService {

    /**
     * Load tasks for the passed application (calls the http service)
     * @param id (number) - the application Id to load the tasks for
     * @param provider (ITaskProvider) - the provider to manage this task
     */
    public loadTasksForApplication(id: number, provider: ITaskProvider ) {
        this.applicationTasks = this.getTasksByApplication(id, provider);
    }

    /**
     * Step to the next step in the sequence
     */
    public next() : void {
        if( !this.applicationTasks )
            throw new Error("No tasks loaded for the current application!");

        this.applicationTasks.getNextItem();
    }

    public getFirstTask() : Task {
        let t: Task = new Task();
        if( !this.applicationTasks )
            throw new Error("No tasks loaded for the current application!");

        // Okay, we must iterate through the tasks and determine which one
        // is incomplete and which conforms to the expected business rules

        return t;
    }

    public applicationTasks: ApplicationTasks;

    constructor( private http: Http ) { }

    /**
     * Call the tracker service to get tasks 
     * @param id (number) - application id
     */ 
    private getTasksByApplication(id: number, provider: ITaskProvider ) : ApplicationTasks {
        let t = new ApplicationTasks(id, provider);

        // Load tasks and override tasks from the service

        return t;
    }

    //private taskIsRead(t: Task, )

}
