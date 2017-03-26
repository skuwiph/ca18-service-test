import { Task } from './task';

export class TaskIntro {

    constructor( options: { 
        taskId: number,
        bodyText: string,
        image?: string
    }) {
        this.taskId = options.taskId;
        this.bodyText = options.bodyText;
        this.image = options.image || 'some-default.png';
    }

    taskId: number;
    bodyText: string;
    image: string;
}