import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetaformDisplayComponent } from './metaform-display.component';

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    ReactiveFormsModule
  ],
  declarations: [MetaformDisplayComponent]
})
export class MetaformModule { }
