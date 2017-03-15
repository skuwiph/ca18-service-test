import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';

import { TrackerService } from './tracker.service';
import { TrackerButtonComponent } from './tracker-button.component';

@NgModule({
    declarations: [
    AppComponent,
    TrackerButtonComponent
],
imports: [
    BrowserModule,
    FormsModule,
    HttpModule
],
providers: [ TrackerService ],
bootstrap: [ AppComponent ]
})
export class AppModule {
    constructor(private tracker: TrackerService ) {
        this.tracker.initialise();
    }
 }
