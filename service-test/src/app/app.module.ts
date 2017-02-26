import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';

import { BusinessRuleService } from './shared/rule/business-rule.service';
import { ApplicationService } from './shared/application/application.service';
import { TrackerService } from './shared/tracker/tracker.service';
import { MetaformService } from './shared/metaform/metaform.service';

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
      HttpModule,
      BusinessRuleService,
      ApplicationService,
      TrackerService,
      MetaformService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
