export class TaskStep {
    /**
     * Is this task complete now?
     */
    consideredComplete() : boolean {
        return false;
    }    

    constructor(options: {
            id?: number,
            stepStatus?: TaskStepStatus,
            routerUrl?: string
        } = {}
    ) {    
        this.id = options.id;
        this.stepStatus = options.stepStatus;
        this.routerUrl = options.routerUrl;
    }

    id: number;
    stepStatus: TaskStepStatus;
    routerUrl: string;
}

export enum TaskStepStatus {
    Intro,
    Stepping,
    Outro
}
