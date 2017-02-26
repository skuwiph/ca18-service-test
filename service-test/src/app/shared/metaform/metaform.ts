import { BusinessRule } from '../rule/business-rule';

export class Metaform {
    version: number;
    lastModified: Date;
    
    
}

export class MfQuestion {
    name: string;
    label: string;
    selectedValue: any;
}

export class MfTextQuestion extends MfQuestion {
    maxLength: number;
}

export class MfMultiTextQuestion extends MfTextQuestion {

}

export class MfTelephoneQuestion extends MfQuestion {
    dialingCode: string;
    number: string;
}

export class MfCountryQuestion extends MfQuestion {

}