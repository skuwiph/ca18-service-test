import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { MetaformDisplayComponent } from './metaform-display.component';
import { MetaformQuestionDisplayComponent } from './metaform-question-display.component';

import { TrackerModule } from '../tracker/tracker.module';
import { routing } from './metaform.routing';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        routing,
        TrackerModule
    ],
    declarations: 
    [
        MetaformDisplayComponent,
        MetaformQuestionDisplayComponent
    ]
})
export class MetaformModule { }
