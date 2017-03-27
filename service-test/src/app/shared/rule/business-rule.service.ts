import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { IBusinessRuleData, BusinessRule, BusinessRulePart, RuleMatchType, RuleComparison } from './business-rule';

@Injectable()
export class BusinessRuleService {

    constructor( private http: Http ) { }

    public getCurrentRules(): BusinessRule[] {
        let rules: BusinessRule[] = [];//this.getRulesFromStorage();

        // Read from Http if null;
        this.getRulesFromServer()
            .subscribe( data => {
                this.rules = data;
                localStorage.setItem("rules", JSON.stringify(this.rules));
            },
            err => console.error(`Getting rules failed: ${err}`));

        return rules;
    }

    public evaluateRule( name: string, data: any ) : boolean {
        //console.info(`Evaluating rule: ${name}`);

        // Check for existence of rules
        if( !this.rules )
            this.rules = this.getCurrentRules();

        let r: BusinessRule = this.getRuleByName( name );

        //console.info(`Rule part field ${r.name}, checking ${r.matchType}`);

        return this.isTrue(r, data );
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
            //console.info(`RuleName: ${name}, ${r.name}`);
            if( r.name == name ) {
                console.info(`Found rule with name ${r.name}, parts count: ${r.parts.length}`);
                return r;
            }
        }

        throw new Error(`No rule with the name '${name}' found!`);
    }

    private getRulesFromServer(): Observable<BusinessRule[]> {
        console.info(`getRulesFromServer`);

        return this.http.get('/app/data/rules/rules.json')
                  .map(this.extractData)
                  .catch(this.handleError);
    }

    private extractData(res: Response) {
        let inLocalStorage = localStorage.getItem("rules");

        if( res.status == 304 && inLocalStorage ) {
            console.debug(`Rules return a 304 and are already in localStorage`);
            return this.getRulesFromStorage();
        } else {
            console.debug(`Rules do not 304 or are not in localStorage`);
            let body = res.json();
            return body || [];
        }
    }

    private getRulesFromStorage() : BusinessRule[] {
        let rules: BusinessRule[] = [];

        // TODO(ian): localStorage 
        if( !localStorage.getItem("rules") ) {
            console.log("No rules stored");
            return null;
        }

        rules = JSON.parse(localStorage.getItem("rules"));

        return rules;
    }    

    private handleError (error: Response | any) {
        // In a real world app, you might use a remote logging infrastructure
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
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

        this.addPart(rule,part);
        rules.push(rule);


        part = new BusinessRulePart();
        part.name = 'heartbroken';
        part.comparison = RuleComparison.NotEquals;
        part.value = 'Y';

        rule = new BusinessRule();
        rule.name = "Test String Rule";
        rule.matchType = RuleMatchType.All;

        this.addPart(rule, part);
        rules.push(rule);

        return rules;
    }

    /** Implementations from BusinessRule */

    isTrue( rule: BusinessRule, dataSource: IBusinessRuleData ) : boolean {
        var matches = (rule.matchType == RuleMatchType.All ? true : false);

        for( let p of rule.parts ) {
            // console.log(`Evaluating ${rule.name}`);
            if( this.evaluateRulePart( p, dataSource ) ) {
                // console.log("Rule evaluated TRUE");

                // Short-circuit; the rule part is true, and if we match any, the whole
                // rule can be considered true.
                if( rule.matchType == RuleMatchType.Any ) {
                    return true;
                }
             } else {
                //  console.log("Rule evaluated FALSE");

                 // Short-circuit; the rule part is false, but we need all rule parts to
                 // be matched in order to satisfy the true condition.
                 if (rule.matchType == RuleMatchType.All ) {
                     return false;
                 }
            }
        }

        return matches;
    }

    public addPart( rule: BusinessRule, p: BusinessRulePart ) {
        // We have some parts, do they make sense            
        if( !this.isValid(p) ) {
            throw new Error(`BusinessRule: Rule parts are not valid for rule ${rule.name}, part was ${p.name}!`);
        }

        rule.parts.push( p );
    }

    /** Implementations from BusinessRule ends */

    /** Implementations from BusinessRulePart
     *  NOTE(ian): I'd like to move these back out to the specific class,
     *  but we need a decent deserialisation strategy in place first.
     */

    public evaluateRulePart( part: BusinessRulePart, dataSource: IBusinessRuleData ) : boolean {
        let comparedValue = dataSource.getValue(part.name);

        // console.log(`>> ${this.comparison}`);

        // if( this.comparison != RuleComparison.Between ) {
        //     console.log(`Evaluating rule ${this.name} with expected value ${this.value} to match ${comparedValue}`);
        // } else {
        //     console.log(`Evaluating rule ${this.name} with match ${comparedValue} between ${this.lowerBoundValue} and ${this.upperBoundValue}`);
        // }

        switch( part.comparison )
        {
            case RuleComparison.Equals:
                // console.log("#### Equals!");
                if( typeof part.value === "string" || typeof part.value === "number" ) {
                    return this.evaluateEquality( part.value, comparedValue );
                } else if ( part.value instanceof Date ) {
                    return this.evaluateEqualityDate( part.value, comparedValue );
                }
            case RuleComparison.NotEquals:
                // console.log("#### Not Equals!");
                if( typeof part.value === "string" || typeof part.value === "number" ) {
                    return !this.evaluateEquality( part.value, comparedValue );
                } else if ( part.value instanceof Date ) {
                    return !this.evaluateEqualityDate( part.value, comparedValue );
                }
            case RuleComparison.Between:
                // console.log("#### Between!");
                if( typeof part.lowerBoundValue === "number" ) {
                    return this.evaluateBetween( part.lowerBoundValue, part.upperBoundValue, comparedValue );
                } else if ( part.lowerBoundValue instanceof Date ) {
                    // console.log("This value is a date between");
                    return this.evaluateBetweenDate( part.lowerBoundValue, part.upperBoundValue, comparedValue );
                }
            default:
                throw new Error("BusinessRulePart::evaluateRule: No comparison matches!");
        }
    }

    public isValid(part: BusinessRulePart) : boolean {
        if( part.comparison == RuleComparison.Between ) {
            if( part.lowerBoundValue === undefined || part.upperBoundValue === undefined ) {
                throw new Error(`BusinessRuleService: Between comparisons required an upper and a lower bound value to be specified: part name was '${part.name}'.`);
            }
        }

        return true;
    }

    private evaluateEquality( value: any, comparedValue: any ) : boolean {
        return value === comparedValue;
    }

    private evaluateEqualityDate( value: Date, comparedValue: Date ) : boolean {
        return value.getTime() === comparedValue.getTime();
    }

    private evaluateBetween( lower: number, upper: number, comparedValue: number ) : boolean {
        return lower <= comparedValue && upper >= comparedValue;
    }

    private evaluateBetweenDate( lower: Date, upper: Date, comparedValue: Date ) : boolean {
        // if( lower.getTime() <= comparedValue.getTime())
        //     console.log("Date is larger than lower bound");

        // if( upper.getTime() >= comparedValue.getTime())
        //     console.log("Date is smaller than upper bound");

        return lower.getTime() <= comparedValue.getTime() 
            && upper.getTime() >= comparedValue.getTime();
    }
    /**
     * BusinessRulePart implementations end
     */
}
