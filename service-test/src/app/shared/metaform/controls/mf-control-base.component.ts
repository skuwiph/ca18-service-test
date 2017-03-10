import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Question, MfValueChangeEvent } from '../metaform';

export class MfControlBaseComponent {
    @Input() question: Question<any>;
    @Input() formGroup: FormGroup;
    @Output() valueChanged = new EventEmitter<MfValueChangeEvent>();

    public updateValue(key: string, value: any){
        this.formGroup.controls[key].setValue( value );
        this.valueChanged.emit(new MfValueChangeEvent( key, value ) );
    }    
}