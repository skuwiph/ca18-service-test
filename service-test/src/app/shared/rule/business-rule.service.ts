import { Injectable } from '@angular/core';

import { IBusinessRuleData, BusinessRule, BusinessRulePart, RuleMatchType, RuleComparison } from './business-rule';

@Injectable()
export class BusinessRuleService {

    constructor() { }

    public addRule( rule: BusinessRule ) {
        // validate

    }
    evaluateRule( name: string, data: any ) : boolean {
        let r: BusinessRule = this.getRuleByName( name );

        return r.isTrue( data );
    }

    public setRules( rules: BusinessRule[] ) : void {
        // Are the rules valid?
        var names: string = "";

        for( let r of rules ) {
            // console.log(`addRule: checking '${r.name}' against '${names}'`);
            if( names.indexOf(r.name) >= 0 ) {
                throw new Error(`BusinessRule: The rule '${r.name}' already exists in this ruleset!`);
            } else {
                names += `${r.name},`;
            }
        }

        this.rules = rules;
    }

    private getRuleByName( name: string ) : BusinessRule {
        // console.log(`Getting rule ${name}`);
        for( let r of this.rules ) {
            if( r.name == name ) {
                return r;
            }
        }

        throw new Error(`No rule with the name '${name}' found!`);
    }

    private rules: BusinessRule[];
}
