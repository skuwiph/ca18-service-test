export class BusinessRule {
    name: string;
    matchType: RuleMatchType;
    isTrue( dataSource: IBusinessRuleData ) : boolean {
        var matches = (this.matchType == RuleMatchType.All ? true : false);

        for( let rule of this.parts ) {
            // console.log(`Evaluating ${rule.name}`);
            if( rule.evaluateRule( dataSource ) ) {
                // console.log("Rule evaluated TRUE");

                // Short-circuit; the rule part is true, and if we match any, the whole
                // rule can be considered true.
                if( this.matchType == RuleMatchType.Any ) {
                    return true;
                }
             } else {
                //  console.log("Rule evaluated FALSE");

                 // Short-circuit; the rule part is false, but we need all rule parts to
                 // be matched in order to satisfy the true condition.
                 if (this.matchType == RuleMatchType.All ) {
                     return false;
                 }
            }
        }

        return matches;
    }

    public addPart( p: BusinessRulePart ) {
        // We have some parts, do they make sense            
        if( !p.isValid() ) {
            throw new Error(`BusinessRule: Rule parts are not valid for rule ${this.name}, part was ${p.name}!`);
        }

        this.parts.push( p );
    }

    private parts: BusinessRulePart[] = [];
}


export class BusinessRulePart {
    name: string;
    comparison: RuleComparison;
    value: any;

    // Used only for 'between' comparisons
    lowerBoundValue: any;
    upperBoundValue: any;

    public evaluateRule( dataSource: IBusinessRuleData ) : boolean {
        let comparedValue = dataSource.getValue(this.name);

        // console.log(`>> ${this.comparison}`);

        // if( this.comparison != RuleComparison.Between ) {
        //     console.log(`Evaluating rule ${this.name} with expected value ${this.value} to match ${comparedValue}`);
        // } else {
        //     console.log(`Evaluating rule ${this.name} with match ${comparedValue} between ${this.lowerBoundValue} and ${this.upperBoundValue}`);
        // }

        switch( this.comparison )
        {
            case RuleComparison.Equals:
                // console.log("#### Equals!");
                if( typeof this.value === "string" || typeof this.value === "number" ) {
                    return this.evaluateEquality( this.value, comparedValue );
                } else if ( this.value instanceof Date ) {
                    return this.evaluateEqualityDate( this.value, comparedValue );
                }
            case RuleComparison.NotEquals:
                // console.log("#### Not Equals!");
                if( typeof this.value === "string" || typeof this.value === "number" ) {
                    return !this.evaluateEquality( this.value, comparedValue );
                } else if ( this.value instanceof Date ) {
                    return !this.evaluateEqualityDate( this.value, comparedValue );
                }
            case RuleComparison.Between:
                // console.log("#### Between!");
                if( typeof this.lowerBoundValue === "number" ) {
                    return this.evaluateBetween( this.lowerBoundValue, this.upperBoundValue, comparedValue );
                } else if ( this.lowerBoundValue instanceof Date ) {
                    // console.log("This value is a date between");
                    return this.evaluateBetweenDate( this.lowerBoundValue, this.upperBoundValue, comparedValue );
                }
            default:
                throw new Error("BusinessRule::evaluateRule: No comparison matches!");
        }
    }

    public isValid() : boolean {
        if( this.comparison == RuleComparison.Between ) {
            if( this.lowerBoundValue === undefined || this.upperBoundValue === undefined ) {
                throw new Error(`BusinessRuleService: Between comparisons required an upper and a lower bound value to be specified: part name was '${this.name}'.`);
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
}

export interface IBusinessRuleData {
    getValue( name: string ): any;
}

export enum RuleMatchType {
    Any = 0,
    All = 1
}

export enum RuleComparison {
    Equals = 1,
    NotEquals = 2,
    GreaterThan = 3,
    LessThan = 4,
    Between = 99
}