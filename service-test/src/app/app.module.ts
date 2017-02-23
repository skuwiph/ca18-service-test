import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';

import { ApplicationService } from './shared/application/application.service';
import { TrackerService } from './shared/tracker/tracker.service';

@NgModule({
  declarations: [
      AppComponent
  ],
  imports: [
      BrowserModule,
      FormsModule,
      HttpModule
  ],
  providers: [ 
      ApplicationService,
      TrackerService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
