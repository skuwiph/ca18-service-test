export interface IBusinessRuleData {
    initialise(): void;
    getValue( name: string ): any;
    setValue( name: string, value: any );
}

export class BusinessRule {
    name: string;
    matchType: RuleMatchType;
    public parts: BusinessRulePart[] = [];
}


export class BusinessRulePart {
    name: string;
    comparison: RuleComparison;
    value: any;

    // Used only for 'between' comparisons
    lowerBoundValue: any;
    upperBoundValue: any;
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