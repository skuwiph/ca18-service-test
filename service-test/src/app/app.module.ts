import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { RouterModule, Routes } from '@angular/router'

import { routing } from './app.routing';
import { AppComponent } from './app.component';
import { StepComponent } from './step.component';

import { WindowSize } from './shared/framework/window-size';
import { BusinessRuleService } from './shared/rule/business-rule.service';
import { ApplicationService } from './shared/application/application.service';

import { TrackerModule } from './shared/tracker/tracker.module';
import { TrackerService } from './shared/tracker/tracker.service';
import { MetaformService } from './shared/metaform/metaform.service';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        NgbModule.forRoot(),
        TrackerModule,
        routing
    ],
    declarations: [
        AppComponent,
        StepComponent
    ],
    providers: [ 
        HttpModule,
        WindowSize,
        BusinessRuleService,
        ApplicationService,
        TrackerService,
        MetaformService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
