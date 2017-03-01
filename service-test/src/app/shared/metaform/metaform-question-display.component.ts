import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Question } from './metaform';

@Component({
    moduleId: module.id,
    selector: 'mf-question',
    templateUrl: './dynamic-form-question.component.html'
})
export class MetaformQuestionDisplayComponent {
    @Input() question: Question<any>;
    @Input() form: FormGroup;
    get isValid() { return false; } // return this.form.controls[this.question.key].valid; }


  
}