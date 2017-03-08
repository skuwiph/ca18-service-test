import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Question, MfOption, MfValueChangeEvent } from './metaform';

@Component({
    moduleId: module.id,
    selector: 'mf-question',
    templateUrl: './metaform-question-display.component.html',
    styleUrls: [ './metaform-question-display.component.css' ]
})
export class MetaformQuestionDisplayComponent {
    @Input() question: Question<any>;
    @Input() formGroup: FormGroup;
    @Output() valueChanged = new EventEmitter<MfValueChangeEvent>();

    get isValid() { 
        if( this.formGroup.controls[this.question.key].pristine ) {
            return true;
        } else {        
            return this.formGroup.controls[this.question.key].valid; 
        }
    }

    get hasLabel() { 
        return this.question.label !== undefined && this.question.label !== null; 
    }

    optionSelected(itemOption: MfOption) {
        return this.formGroup.controls[this.question.key].value == itemOption.code;
    }
    
    // TODO(ian): define some better class names for options
    optionClass(index: number){
        switch(index) {
            case 0:
                return "alert-primary";
            case 1:
                return "alert-secondary";
            case 2:
                return "alert-tertiary";
            default:
                return "alert";
        }
    }

    onTextChange(event) {
        console.debug(`newValue: ${event.target.value}`);
        this.updateValue(this.question.key, event.target.value );
    }

    selectOption(itemOption: MfOption) {
        this.updateValue(this.question.key, itemOption.code );
    }

    private updateValue(key: string, value: any){
        this.formGroup.controls[key].setValue( value );
        this.valueChanged.emit(new MfValueChangeEvent( key, value ) );
    }

}