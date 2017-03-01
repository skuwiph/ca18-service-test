import { BusinessRule } from '../rule/business-rule';

export class Metaform {
    name: string;
    version: number;
    lastModified: Date;
    checkModifiedAfter = new Date( Date.now() );

    questions: MfQuestion[] = [];
}

// An MfQuestion can contain more than one control;
// in the case of a telephone number, it must contain
// a country code selector AND a textbox.
export class MfQuestion {
    name: string;
    caption?: string;
    items: Question<any>[] = [];

    constructor(name: string, items:Question<any>[], caption?: string) {
        this.name = name;
        this.items = items;
        this.caption = caption;
    }
}

export class Question<T> {
  value: T;
  key: string;
  label: string;
  required: boolean;
  order: number;
  controlType: string;
  section: string;
  
  constructor(options: {
      value?: T,
      key?: string,
      label?: string,
      required?: boolean,
      order?: number,
      controlType?: string,
      section?: string
    } = {}
) {
    this.value = options.value;
    this.key = options.key || '';
    this.label = options.label || '';
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType || '';
    this.section = options.section || '';
  }
}

export class MfTextQuestion extends Question<string> {
    controlType = 'textbox';
    type: string;
    maxLength: number;

    constructor(options: {} = {}) {
        super(options);
        this.type = options['type'] || '';
    } 
}

export class MfMultiTextQuestion extends Question<string> {

}

export class MfTelephoneNumber {
    iddCode?: string;
    number?: string;
    constructor( iddCode: string, number: string) {
        this.iddCode = iddCode;
        this.number = number;
    }
}

export class MfTelephoneQuestion extends Question<MfTelephoneNumber> {
    dialingCode: string;
    number: string;
}

// export class MfCountryQuestion extends Question {

// }

export class MfOptionSelection extends Question<MfOption> {
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