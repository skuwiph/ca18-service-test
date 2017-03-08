import { BusinessRule } from '../rule/business-rule';

export class ApplicationSequence {
    // The default sequence required
    sequence: TrackerSequence[];

    // If we have override sequence(s), they should go here.
    // This may be updated via a push service so we're always up-to-date
    prioritySequenceId: number[];

    // The homepage
    homePageUrl: string;
}

export class TrackerSequence {
    // Sequence Id
    id: number;

    complete: boolean;

    title: string;
    ruleToMatch?: string; 
    type: TrackerSequenceType;
    // steps: SequenceStep[];

    sequenceIntroPage: string;
    sequenceOutroPage: string;

    // If step is a metaform?
    metaformName?: string;

    // If step is custom?

    // What's the next step to take
    currentStep?: number;

    routerUrl?: string;

    constructor( id: number, title: string, type: TrackerSequenceType, intro: string, outro: string, url: string, ruleToMatch?: string ) {
        this.id = id;
        this.title = title;
        this.ruleToMatch = ruleToMatch;
        this.type = type;
        this.sequenceIntroPage = intro;
        this.sequenceOutroPage = outro;
        this.routerUrl = url;
    }

}

// export class SequenceStep {
//     // Step Id
//     id: number;
//     complete: boolean;

//     // Are there any rules?
//     ruleToMatch?: string; 

//     // For metaform 'pages'
//     stepName?:string;

//     // TODO(ian): figure out what we need to do for routes
//     // with replacements in
//     routerUrl?: any[];

// }

export enum TrackerSequenceType {
    Custom = 0,
    Metaform = 1
};

// Interface for a custom tracker step
export interface ITrackerStepComponent {
    // Called when the tracker buttons advance
    setNextStep(): void;
    
}