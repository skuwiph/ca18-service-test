/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TrackerService } from './tracker.service';

describe('TrackerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TrackerService]
    });
  });

  it('should ...', inject([TrackerService], (service: TrackerService) => {
    expect(service).toBeTruthy();
  }));
});
