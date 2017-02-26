import { BusinessRule } from '../rule/business-rule';

export class Metaform {
    name: string;
    version: number;
    lastModified: Date;
    checkModifiedAfter = new Date( Date.now() );

    questions: MfQuestion<any>[];
}

export class MfQuestion<T> {
  value: T;
  key: string;
  label: string;
  required: boolean;
  order: number;
  controlType: string;
  constructor(options: {
      value?: T,
      key?: string,
      label?: string,
      required?: boolean,
      order?: number,
      controlType?: string
    } = {}) {
    this.value = options.value;
    this.key = options.key || '';
    this.label = options.label || '';
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType || '';
  }
}

export class MfTextQuestion extends MfQuestion<string> {

    controlType = 'textbox';
    type: string;
    maxLength: number;

    constructor(options: {} = {}) {
        super(options);
        this.type = options['type'] || '';
    } 
}

export class MfMultiTextQuestion extends MfTextQuestion {

}

// export class MfTelephoneQuestion extends MfQuestion {
//     dialingCode: string;
//     number: string;
// }

// export class MfCountryQuestion extends MfQuestion {

// }

export class MfOptionSelection extends MfQuestion<MfOption> {
    //private options: MfOption[];
    controlType = 'dropdown';
    options:MfOption[] = [];    

    constructor(options: {} = {}) {
        super(options);
        this.options = options['type'] || '';
    }
}

export class MfOption {
    code: string;
    description: string;
}