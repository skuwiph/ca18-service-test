import { BusinessRule } from '../rule/business-rule';

export class ApplicationSequence {
    sequence: TrackerSequence[];
}

export class TrackerSequence {
    // Sequence Id
    id: number;

    complete: boolean;

    title: string;
    ruleToMatch: string; 
    type: TrackerSequenceType;
    steps: SequenceStep[];

    // If step is a metaform?
    metaformName?: string;

    // If step is custom?

    constructor( id: number, title: string, ruleToMatch: string, type: TrackerSequenceType ) {
        this.id = id;
        this.title = title;
        this.ruleToMatch = ruleToMatch;
        this.type = type;
        this.steps = [];    
    }

}

export class SequenceStep {
    // Step Id
    id: number;

    // TODO(ian): figure out what we need to do for routes
    // with replacements in
    routerUrl?: string;
}

export enum TrackerSequenceType {
    Custom = 0,
    Metaform = 1
};