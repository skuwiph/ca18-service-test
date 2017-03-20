import { Task } from './task';

export class TaskIntro {

    constructor( options: { 
        task: Task,
        bodyText: string,
        image?: string
    }) {
        this.task = options.task;
        this.bodyText = options.bodyText;
        this.image = options.image || 'some-default.png';
    }

    task: Task;
    bodyText: string;
    image: string;
}