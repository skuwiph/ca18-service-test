import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MfQuestion } from './metaform';

@Component({
  moduleId: module.id,
  selector: 'mf-question',
  templateUrl: './dynamic-form-question.component.html'
})
export class MetaformQuestionDisplayComponent {
  @Input() question: MfQuestion<any>;
  @Input() form: FormGroup;
  get isValid() { return this.form.controls[this.question.key].valid; }
}