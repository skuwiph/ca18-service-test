export class Metaform {
    name: string;
    version: number;
    lastModifiedTicks: number;
    checkModifiedAfterTicks: number;
    
    sections: MetaformSection[] = [];
    questions: MfQuestion[] = [];

    // For the tracker: how many questions in total
    // do we have, regardless of whether they are
    // valid according to the rules
    totalQuestionCount?: number;
}

// A section represents a number of grouped questions.
// In the desktop version, all of the contained questions will 
// probably be displayed. In the mobile version, however, we 
// will only display one at a time.
export class MetaformSection {
    id: number;
    title: string;              // Used in displays
    ruleToMatch?: string;
}

// An MfQuestion can contain more than one control;
// in the case of a telephone number, it must contain
// a country code selector AND a textbox.
export class MfQuestion {
    sectionId: number;
    name: string;
    caption?: string;
    ruleToMatch?: string;
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
  options?: MfOption[];
  validators?: string[];

  constructor(options: {
      value?: T,
      key?: string,
      label?: string,
      required?: boolean,
      order?: number,
      controlType?: string,
      options?: MfOption[],
      validators?: string[]
    } = {}
) {
    this.value = options.value;
    this.key = options.key || '';
    this.label = options.label || '';
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType || '';
    this.options = options.options || undefined;
    this.validators = options.validators || undefined;
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
    controlType = 'optionselect';
    options:MfOption[] = [];    

    constructor(options: {} = {}) {
        super(options);
        this.options = options['options'] || '';
    }
}

export class MfOption {
    code: string;
    description: string;
}

export class MfValueChangeEvent {
    name: string;
    value: any;

    constructor(name: string, value: any) {
        this.name = name;
        this.value = value;
    }
}