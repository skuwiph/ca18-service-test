import { Sequence } from './sequence';

export class Task {
    // We do not know how many steps each task may have;
    // that's the purview of the specific tasks themselves --
    // for example, a metaform may have [n] questions, or [n] pages, 
    // depending on display type, while a process like record skills
    // may have multiple steps, dependent on how many skills the applicant
    // adds


    public validForRules(): boolean {
        return true;
    }

    public setComplete() : void {
        this.taskStatus = TaskStatus.Complete;
    }

    constructor(options: {
            sequence?: Sequence,
            id?: number,
            name?: string,
            title?: string,
            taskType?: number,
            routerUrl?: string,
            routes?: string[],
            totalSteps?: number,
            introTemplate?: TaskIntroTemplate,
            outroTemplate?: TaskOutroTemplate,
            complete?: boolean
        } = {}
    ) {
        this.sequence = options.sequence;

        this.id = options.id;
        this.name = options.name;
        this.title = options.title;
        this.routerUrl = options.routerUrl;
        
        this.taskType = options.taskType;

        // Optionals
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

    sequence: Sequence;
    isValid: boolean;

    taskType: number;
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
