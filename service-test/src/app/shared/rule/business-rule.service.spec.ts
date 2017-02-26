/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { BusinessRuleService } from './business-rule.service';
import { BusinessRule, BusinessRulePart, RuleComparison, RuleMatchType, IBusinessRuleData } from './business-rule';

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
}

describe('BusinessRuleService', () => {
    let testData = new DataSourceForTest();
    let allRules: BusinessRule[] = [];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [BusinessRuleService]
        });
    });

    beforeAll( () => {
        allRules = [];
        allRules.push( createStringRule() );
        allRules.push( createDateRule( 'Date Equality Rule' ) );
        allRules.push( createDateRangeRule("Date Between Rule", "time", new Date(2017,1,1, 10, 45, 0, 0), new Date(2017,1,1, 11, 45, 0, 0)))
        allRules.push( createNumericRangeRule("Number Between Rule", "number", 4, 6 ) );
        allRules.push( createAllMatchStringRule() );
    });

    it('should evaluate a string rule...', inject([BusinessRuleService], (service: BusinessRuleService) => {
        service.setRules(allRules);
        expect(service.evaluateRule("Test String Rule", testData)).toBeTruthy();
    }));  

    it('should evaluate a date rule...', inject([BusinessRuleService], (service: BusinessRuleService) => {
        service.setRules(allRules);
        expect(service.evaluateRule("Date Equality Rule", testData)).toBeTruthy();
    }));  

    it('should evaluate a date between rule...', inject([BusinessRuleService], (service: BusinessRuleService) => {
        service.setRules(allRules);
        expect(service.evaluateRule("Date Between Rule", testData)).toBeTruthy();
    }));      

    it('should evaluate a number between rule...', inject([BusinessRuleService], (service: BusinessRuleService) => {
        service.setRules(allRules);
        expect(service.evaluateRule("Number Between Rule", testData)).toBeTruthy();
    }));      

    it('should disallow duplicate rules names...', inject([BusinessRuleService], (service: BusinessRuleService) => {
        var duplicateRules: BusinessRule[] = allRules.slice(); // Must copy by value 
        duplicateRules.push( createStringRule() );
        expect( function() { service.setRules(duplicateRules); } ).toThrow( new Error("BusinessRule: The rule 'Test String Rule' already exists in this ruleset!") ;
    }));  

    it('should evaluate a valid MatchALL string rule...', inject([BusinessRuleService], (service: BusinessRuleService) => {
        service.setRules(allRules);
        expect(service.evaluateRule("Test String Rule MatchType ALL", testData)).toBeTruthy();
    }));  

            
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