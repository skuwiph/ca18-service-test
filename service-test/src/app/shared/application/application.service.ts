import { Injectable } from '@angular/core';
import { IBusinessRuleData } from '../rule/business-rule';

@Injectable()
export class ApplicationService implements IBusinessRuleData {

    // Implementation of IBusinessRuleData interface
    public initialise(): void {

    }

    public getValue( name: string ): any {
        console.info(`Someone's asking for '${name}'`);
    }
    // Implementation of IBusinessRuleData interface


    constructor() { }


}
