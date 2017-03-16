import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { CreateApplicationComponent } from './create-application.component';

import { TrackerModule } from '../shared/tracker/tracker.module';
import { routing } from './application.routing';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        routing,
        TrackerModule
    ],
    declarations: 
    [
        CreateApplicationComponent,
    ]  
})
export class ApplicationModule { }
