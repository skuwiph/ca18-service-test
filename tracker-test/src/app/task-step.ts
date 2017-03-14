export class TaskStep {
    /**
     * Is this task complete now?
     */
    consideredComplete() : boolean {
        return false;
    }    
}

export enum TaskStepStatus {
    Intro,
    Stepping,
    Outro
}
