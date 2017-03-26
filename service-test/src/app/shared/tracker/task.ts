import { Sequence } from './sequence';

export class Task {
    constructor(options: {
            sequenceId?: number,
            id?: number,
            name?: string,
            title?: string,
            taskType?: TaskType,
            routerUrl?: string,
            routes?: string[],
            totalSteps?: number,
            introTemplate?: TaskIntroTemplate,
            outroTemplate?: TaskOutroTemplate,
            complete?: boolean
        } = {}
    ) {
        this.sequenceId = options.sequenceId;

        this.id = options.id;
        this.name = options.name;
        this.title = options.title;
        this.routerUrl = options.routerUrl;
        
        // Optionals
        this.taskType = options.taskType || TaskType.Default;
        this.routes = options.routes || [];
        this.totalSteps = options.totalSteps || 1;
        this.introTemplate = options.introTemplate || TaskIntroTemplate.None;
        this.outroTemplate = options.outroTemplate || TaskOutroTemplate.None;
        this.complete = options.complete || false;

        // Ensure status is up to date with complete flag
        if( this.complete ) this.taskStatus = TaskStatus.Complete;

        this.currentStep = 0;
    }

    id: number;
    name: string;
    title: string;
    routerUrl: string;
    totalSteps: number;
    taskStatus: TaskStatus;
    introTemplate: TaskIntroTemplate;
    outroTemplate: TaskOutroTemplate;
    complete: boolean;
    currentStep: number;

    routes: string[];

    sequenceId: number;
    isValid: boolean;

    taskType: TaskType;
}

export enum TaskIntroTemplate {
    None,
    Default
}

export enum TaskOutroTemplate {
    None,
    Default
}

export enum TaskStatus {
    Intro,
    Stepping,
    Outro,
    Complete
}

export enum TaskType {
    Default = 0,
    Metaform = 1
}