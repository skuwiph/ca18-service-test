import { Task } from './task';

export class TaskOutro {

    constructor( options: { 
        task: Task,
        bodyText: string,
        image?: string
    }) {
        this.task = options.task;
        this.bodyText = options.bodyText;
        this.image = options.image || 'img/sequence/medal.png';
    }

    task: Task;
    bodyText: string;
    image: string;
}