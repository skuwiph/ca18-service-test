import { Component } from '@angular/core';
import { MfControlBaseComponent } from './mf-control-base.component';

@Component({
	template: `<input 
        [id]="question.key" 
        class="form-control" 
        [formControlName]="question.key" 
        [type]="question.controlType" 
        placeholder="{{question.label}}" 
        (change)="onTextChange($event)" 
        (input)="onTextChange($event)">`
})
export class MfTextControlComponent extends MfControlBaseComponent {
    
    constructor(){
        //Run base constructor
        super();
        //Child component constructor logic...
        console.log('MfTextControlComponent');
    }
    
    onTextChange(event) {
        console.debug(`newValue: ${event.target.value}`);
        super.updateValue(this.question.key, event.target.value );
    }
}