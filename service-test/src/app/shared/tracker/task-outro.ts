import { Task } from './task';

export class TaskOutro {

    constructor( options: { 
        taskId: number,
        bodyText: string,
        image?: string
    }) {
        this.taskId = options.taskId;
        this.bodyText = options.bodyText;
        this.image = options.image || 'img/sequence/medal.png';
    }

    taskId: number;
    bodyText: string;
    image: string;
}