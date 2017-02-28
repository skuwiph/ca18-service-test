import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { MetaformDisplayComponent } from './metaform-display.component';

import { routing } from './metaform.routing';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    routing
  ],
  declarations: [MetaformDisplayComponent]
})
export class MetaformModule { }
