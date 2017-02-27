import { Injectable } from '@angular/core';

import { TrackerSequence, SequenceStep } from './tracker-sequence';

@Injectable()
export class TrackerService {

  constructor() { }

  navigateToStep( sequence: TrackerSequence, step: SequenceStep ) {
      // TODO(ian): Add router information in too
      
  }
}
