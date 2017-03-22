import { Injectable } from '@angular/core';
import { IBusinessRuleData } from '../rule/business-rule';

@Injectable()
export class ApplicationService implements IBusinessRuleData {

    private applicationData: Map<string, any>;

    constructor() { 
        this.applicationData = new Map<string, any>();

        // TODO(ian): move to initialise

        // TODO(ian): have initialise specify the form or sequence it's using?
        this.applicationData.set('firstName','Tomas');
        this.applicationData.set('lastName', 'Walker');
        this.applicationData.set('email', 'twalker@example.com');
        this.applicationData.set('heartbroken', 'N');
        this.applicationData.set('iddCode', '44');
        this.applicationData.set('telephoneNumber', '12345678');
    }

    // Implementation of IBusinessRuleData interface
    public initialise(): void {

    }

    public getValue( name: string ): any {
        // console.info(`Someone's asking for '${name}'`);

        if( this.applicationData.has(name) ) {
            // console.info(`${name} exists with value ${this.applicationData.get(name)}`);
            return this.applicationData.get(name);
        }
    }

    public setValue( name: string, value: any ) {
        // console.info(`Someone's setting ${name} to '${value}'`);

        this.applicationData.set(name, value);
    }

    // Implementation of IBusinessRuleData interface
}