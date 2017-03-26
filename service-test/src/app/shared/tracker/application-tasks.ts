import { Task, TaskStatus, TaskIntroTemplate, TaskOutroTemplate } from './task';

import { ITaskProvider } from './task-provider';
import { ITaskRouterProvider } from './task-router-provider';

export class ApplicationTasks {

    public currentTask: Task;
    public nextTaskInQueue: Task;
    
    public tasks: Array<Task> = new Array<Task>();
    public overrideTasks: Array<Task>;
    
    public static readonly DIRECTION_FORWARDS: number = +1;
    public static readonly DIRECTION_BACKWARDS: number = -1;

    //constructor( private id: number, private provider: ITaskProvider ) {}
    constructor() {}
}
