/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { TrackerService } from './tracker.service';

import { BusinessRuleService } from '../rule/business-rule.service';
import { MetaformService } from '../metaform/metaform.service';

describe('TrackerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [TrackerService, MetaformService, BusinessRuleService]
    });
  });

  it('should ...', inject([TrackerService], (service: TrackerService) => {
    expect(service).toBeTruthy();
  }));
});
