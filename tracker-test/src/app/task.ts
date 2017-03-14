import { TaskStep } from './task-step';

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
}


