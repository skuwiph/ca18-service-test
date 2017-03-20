import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { CreateApplicationComponent } from './create-application.component';
import { CreateApplicationStep2Component } from './create-application-step2.component';

import { TrackerModule } from '../shared/tracker/tracker.module';
import { routing } from './application.routing';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        routing,
        TrackerModule
    ],
    declarations: 
    [
        CreateApplicationComponent,
        CreateApplicationStep2Component,
    ]  
})
export class ApplicationModule { }
