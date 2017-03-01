import { Injectable } from '@angular/core';

import { IBusinessRuleData, BusinessRule, BusinessRulePart, RuleMatchType, RuleComparison } from './business-rule';

@Injectable()
export class BusinessRuleService {

    constructor() { }

    public getCurrentRules() : BusinessRule[] {
        let rules: BusinessRule[] = this.getRulesFromStorage();

        // Read from Http if null;
        if( rules == null ) {
            console.debug(`Reading Http for rules will be necessary`);
        }

        return rules;
    }

    public evaluateRule( name: string, data: any ) : boolean {
        let r: BusinessRule = this.getRuleByName( name );

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
                return r;
            }
        }

        throw new Error(`No rule with the name '${name}' found!`);
    }

    private getRulesFromStorage() : BusinessRule[] {
        let rules: BusinessRule[] = [];

        // TODO(ian): localStorage 
        if( localStorage.getItem("rules") === undefined ) {
            console.log("No rules stored");
        }

        rules = JSON.parse(localStorage.getItem("rules"));

        return rules;
    }    

    private rules: BusinessRule[];
}
