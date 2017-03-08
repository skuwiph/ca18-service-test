import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Question } from './metaform';

@Component({
    moduleId: module.id,
    selector: 'mf-question',
    templateUrl: './metaform-question-display.component.html',
    styleUrls: [ './metaform-question-display.component.css' ]
})
export class MetaformQuestionDisplayComponent {
    @Input() question: Question<any>;
    @Input() formGroup: FormGroup;

    get isValid() { 
        if( this.formGroup.pristine ) {
            return true;
        } else {        
            return this.formGroup.controls[this.question.key].valid; 
        }
    }

    get hasLabel() { 
        return this.question.label !== undefined && this.question.label !== null; 
    }

    // TODO(ian): Add an 'ispicked' and something for the choice colour?
    
}