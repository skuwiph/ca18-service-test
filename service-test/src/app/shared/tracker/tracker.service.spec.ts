/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { Router,ActivatedRoute  } from '@angular/router';

import { TrackerService } from './tracker.service';
import { TrackerSequence, SequenceStep } from './tracker-sequence';
import { BusinessRuleService } from '../rule/business-rule.service';
import { BusinessRule, BusinessRulePart, IBusinessRuleData, RuleComparison, RuleMatchType } from '../rule/business-rule';
import { MetaformService } from '../metaform/metaform.service';

class RouterStub {
  navigate(url: string[]) {
        let fullRoute = '';
        for(let r in url) {
            fullRoute += "\\" + r;
        }

        console.log(`Routing to ${fullRoute}`);
 }
  navigateByUrl(url: string) { return url; }
}

class DataSourceForTest implements IBusinessRuleData {
    constructor( ){}

    // In the actual implementation, we would be getting the data now
    initialise(): void {

    }

    public getValue( name: string ) : any {
        if ( name === 'string' ) return 'test';
        
        if ( name === 'string1' ) return 'test1';
        if ( name === 'string2' ) return 'test2';

        if( name === 'date' ) return new Date(2017, 1, 1, 10, 45, 0, 0);
        if( name === 'time' ) return new Date(2017, 1, 1, 10, 59, 0, 0);
        if( name === 'number' ) return 5;
    }

    public setValue(name:string, value: any) {

    }
}


describe('TrackerService', () => {
    let testData = new DataSourceForTest();
    let allRules: BusinessRule[] = [];

    beforeAll( () => {
        allRules = [];
        allRules.push( createStringRule() );
        allRules.push( createDateRule( 'Date Equality Rule' ) );
        allRules.push( createDateRangeRule("Date Between Rule", "time", new Date(2017,1,1, 10, 45, 0, 0), new Date(2017,1,1, 11, 45, 0, 0)))
        allRules.push( createNumericRangeRule("Number Between Rule", "number", 4, 6 ) );
        allRules.push( createAllMatchStringRule() );
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
        imports: [HttpModule],
        providers: [
            TrackerService,
            MetaformService,
            BusinessRuleService,
            { 
                provide: Router,      
                useClass: RouterStub 
            }
        ]
        });
    });

    it('should ...', inject([TrackerService], (service: TrackerService) => {
        expect(service).toBeTruthy();
    }));

    it('should return the first sequence with a business rule match', inject([TrackerService], (service: TrackerService) => {
        let sequence = service.loadSequenceForApplication(1, true);
        expect(service.findFirstMatchingSequence(sequence, allRules, testData).id == 2).toBeTruthy();
    }));

    it('should return the first override sequence if one exists', inject([TrackerService], (service: TrackerService) => {
        let sequence = service.loadSequenceForApplication(1, true);
        sequence.prioritySequenceId = [3];
        expect(service.findFirstMatchingSequence(sequence, allRules, testData).id == 3).toBeTruthy();
    }));

    it('should remove the first override sequence if it is marked as complete', inject([TrackerService], (service: TrackerService) => {
        let appSeq = service.loadSequenceForApplication(1, true);
        appSeq.prioritySequenceId = [3];
        let seq = service.findFirstMatchingSequence(appSeq, allRules, testData);

        // Mark as complete
        service.markSequenceComplete( appSeq, seq );

        expect( appSeq.prioritySequenceId.length == 0 ).toBeTruthy();
    }));

    // it('should find the first matching step',
    //     inject([Router, TrackerService], (router: Router, service: TrackerService) => { // ...
    //     let appsequence = service.loadSequenceForApplication(1, true);
    //     let sequence = service.findFirstMatchingSequence(appsequence, allRules, testData);
    //     let step = service.findFirstMatchingStep(sequence, allRules, testData);

    //     expect(step.id == 100).toBeTruthy();
    // }));

    // it('should get the correct url for the first matching step',
    //     inject([Router, TrackerService], (router: Router, service: TrackerService) => { // ...
    //     let appsequence = service.loadSequenceForApplication(1, true);
    //     let sequence = service.findFirstMatchingSequence(appsequence, allRules, testData);
    //     let step = service.findFirstMatchingStep(sequence, allRules, testData);

    //     const spy = spyOn(router, 'navigate');

    //     service.navigateToStep(sequence, step, router); 

    //     // args passed to router.navigate()
    //     const navArgs = spy.calls.first().args[0];
    //     expect(navArgs[0]).toBe('sequence/page', 'should nav to sequence/page for first step');
    // }));    
  
});

function createStringRule() : BusinessRule {
        let part = new BusinessRulePart();
        part.name = 'string';
        part.comparison = RuleComparison.Equals;
        part.value = 'test';

        let r = new BusinessRule();
        r.matchType = RuleMatchType.All;
        r.name = 'Test String Rule';
        r.addPart( part );

        return r;
}

function createAllMatchStringRule() : BusinessRule {
        let p1 = new BusinessRulePart();
        p1.name = 'string1';
        p1.comparison = RuleComparison.Equals;
        p1.value = 'test1';

        let p2 = new BusinessRulePart();
        p2.name = 'string2';
        p2.comparison = RuleComparison.Equals;
        p2.value = 'test2';

        let r = new BusinessRule();
        r.matchType = RuleMatchType.All;
        r.name = 'Test String Rule MatchType ALL';
        r.addPart( p1 );
        r.addPart( p2 );

        return r;
}

function createDateRule(name: string ) : BusinessRule {
        let part = new BusinessRulePart();
        part.name = 'date';
        part.comparison = RuleComparison.Equals;
        part.value = new Date(2017,1,1, 10, 45, 0, 0);

        let r = new BusinessRule();
        r.matchType = RuleMatchType.All;
        r.name = name;
        r.addPart( part );
    
        return r;
}

function createDateRangeRule(name: string, n1: string, lv: Date, uv: Date ) : BusinessRule {
        let part = new BusinessRulePart();
        part.name = n1;
        part.comparison = RuleComparison.Between;
        part.lowerBoundValue = lv;
        part.upperBoundValue = uv;

        let r = new BusinessRule();
        r.matchType = RuleMatchType.Any;
        r.name = name;
        r.addPart( part );
    
        return r;
}

function createNumericRangeRule(name: string, n1: string, lv: number, uv: number ) : BusinessRule {
        let part = new BusinessRulePart();
        part.name = n1;
        part.comparison = RuleComparison.Between;
        part.lowerBoundValue = lv;
        part.upperBoundValue = uv;

        let r = new BusinessRule();
        r.matchType = RuleMatchType.Any;
        r.name = name;
        r.addPart( part );
    
        return r;
}
