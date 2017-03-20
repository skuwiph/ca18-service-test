export class Task {
    // We do not know how many steps each task may have;
    // that's the purview of the specific tasks themselves --
    // for example, a metaform may have [n] questions, or [n] pages, 
    // depending on display type, while a process like record skills
    // may have multiple steps, dependent on how many skills the applicant
    // adds
    isValid() : boolean { 
        return true;
    }

    public newlyAssigned: boolean;
    public setComplete() : void {
        this.taskStatus = TaskStatus.Complete;
    }

    constructor(options: {
            id?: number,
            name?: string,
            routerUrl?: string,
            totalSteps?: number,
            introTemplate?: TaskIntroTemplate,
            outroTemplate?: TaskOutroTemplate,
            complete?: boolean
        } = {}
    ) {
        this.id = options.id;
        this.name = options.name;
        this.routerUrl = options.routerUrl;
        // Optionals
        this.totalSteps = options.totalSteps || 1;
        this.introTemplate = options.introTemplate || TaskIntroTemplate.None;
        this.outroTemplate = options.outroTemplate || TaskOutroTemplate.None;
        this.complete = options.complete || false;

        // Ensure status is up to date with complete flag
        if( this.complete ) this.taskStatus = TaskStatus.Complete;
    }

    id: number;
    name: string;
    routerUrl: string;
    totalSteps: number;
    taskStatus: TaskStatus;
    introTemplate: TaskIntroTemplate;
    outroTemplate: TaskOutroTemplate;
    complete: boolean;
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
