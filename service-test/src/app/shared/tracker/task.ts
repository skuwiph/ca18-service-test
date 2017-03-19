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

    constructor(options: {
            id?: number,
            name?: string,
            routerUrl?: string,
            totalSteps?: number,
        } = {}
    ) {
        this.id = options.id;
        this.name = options.name;
        this.routerUrl = options.routerUrl;
        // Optionals
        this.totalSteps = options.totalSteps || 1;
    }

    id: number;
    name: string;
    routerUrl: string;
    totalSteps: number;
    taskStatus: TaskStatus;
    complete: boolean;
}

export enum TaskStatus {
    Intro,
    Stepping,
    Outro
}
