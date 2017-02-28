import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { RouterModule, Routes } from '@angular/router'

import { routing } from './app.routing';
import { AppComponent } from './app.component';
import { StepComponent } from './step.component';

import { BusinessRuleService } from './shared/rule/business-rule.service';
import { ApplicationService } from './shared/application/application.service';
import { TrackerService } from './shared/tracker/tracker.service';
import { MetaformService } from './shared/metaform/metaform.service';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        routing
    ],
    declarations: [
        AppComponent,
        StepComponent
    ],
    providers: [ 
        HttpModule,
        BusinessRuleService,
        ApplicationService,
        TrackerService,
        MetaformService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
