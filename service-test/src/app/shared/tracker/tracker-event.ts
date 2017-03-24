export class TrackerEvent {
    constructor( event: TrackerEventType ) {
        this.event = event;
    }

    public event: TrackerEventType;
}

export enum TrackerEventType {
    Initialising,
    TasksLoaded,
    ActiveTaskChanged
}
