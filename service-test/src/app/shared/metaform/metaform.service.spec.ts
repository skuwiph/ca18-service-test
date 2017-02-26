/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { BusinessRuleService } from '../rule/business-rule.service';
import { MetaformService } from './metaform.service';

describe('MetaformService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [MetaformService, BusinessRuleService ]
    });
  });

  it('should ...', inject([MetaformService], (service: MetaformService) => {
    // const ruleService = new BusinessRuleService();
    // //const stubValue = 'stub value';
    // //const spy = spyOn(fancy, 'getValue').and.returnValue(stubValue);
    // service = new MetaformService(ruleService);

    expect(service).toBeTruthy();
  }));
});
