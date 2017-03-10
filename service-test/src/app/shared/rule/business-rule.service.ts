import { Injectable } from '@angular/core';

import { IBusinessRuleData, IBusinessRule, IBusinessRulePart, BusinessRule, BusinessRulePart, RuleMatchType, RuleComparison } from './business-rule';

@Injectable()
export class BusinessRuleService {

    constructor() { }

    public getCurrentRules() : BusinessRule[] {
        console.log(`Getting current ruleset`);

        let rules: BusinessRule[] = this.getRulesFromStorage();

        // Read from Http if null;
        if( rules == null ) {
            console.debug(`Reading Http for rules will be necessary`);

            // TODO(ian): Narf. No rules yet!
            rules = this.createTestRuleset();
        }

        return rules;
    }

    public evaluateRule( name: string, data: any ) : boolean {
        console.info(`Evaluating rule: ${name}`);

        // Check for existence of rules
        if( !this.rules )
            this.rules = this.getCurrentRules();

        let r: BusinessRule = this.getRuleByName( name );

        console.info(`Rule part field ${r.name}, checking ${r.matchType}`);

        return r.isTrue( data );
    }

    public setRules( rules: BusinessRule[] ) : void {
        // Are the rules valid?
        var names: string = "";

        for( let r of rules ) {
            if( names.indexOf(r.name) >= 0 ) {
                throw new Error(`BusinessRule: The rule '${r.name}' already exists in this ruleset!`);
            } else {
                names += `${r.name},`;
            }
        }

        this.rules = rules;
    }

    private getRuleByName( name: string ) : BusinessRule {
        for( let r of this.rules ) {
            if( r.name == name ) {
                console.info(`Found rule with name ${r.name}, parts count: ${r.parts.length}`);
                return r;
            }
        }

        throw new Error(`No rule with the name '${name}' found!`);
    }

    private getRulesFromStorage() : BusinessRule[] {
        let rules: BusinessRule[] = [];

        // TODO(ian): localStorage 
        if( localStorage.getItem("rules") ) {
            console.log("No rules stored");
        }

        rules = JSON.parse(localStorage.getItem("rules"));

        return rules;
    }    

    private rules: BusinessRule[];

    private createTestRuleset() : BusinessRule[] {
        let rules: BusinessRule[] = [];

        let part: BusinessRulePart = new BusinessRulePart();
        part.name = 'heartbroken';
        part.comparison = RuleComparison.Equals;
        part.value = 'Y';

        let rule: BusinessRule = new BusinessRule();
        rule.name = "ReadyToBeHeartbroken";
        rule.matchType = RuleMatchType.All;

        rule.addPart(part);
        rules.push(rule);


        part = new BusinessRulePart();
        part.name = 'heartbroken';
        part.comparison = RuleComparison.NotEquals;
        part.value = 'Y';

        rule = new BusinessRule();
        rule.name = "Test String Rule";
        rule.matchType = RuleMatchType.All;

        rule.addPart(part);
        rules.push(rule);

        return rules;
    }
}
