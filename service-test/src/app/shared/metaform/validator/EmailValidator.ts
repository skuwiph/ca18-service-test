import { FormControl, FormGroup, Validators, ValidatorFn } from '@angular/forms';

// NOTE(ian): would be good to have an interface for this, but the
// formcontrols use a static validator function 
export class EmailValidator {

   static isValidMailFormat(control: FormControl) {
        if( !EmailValidator.isValid(control.value)){
            return { "Please provide a valid email": true };
        }
        return null;
    }

    static isValid( value: string ) {
        let EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
        if (value != "" && (value.length <= 5 || !EMAIL_REGEXP.test(value))) {
            return false;
        }
        return true;
    }

}
