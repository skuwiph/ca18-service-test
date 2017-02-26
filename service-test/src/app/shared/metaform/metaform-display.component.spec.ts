/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { HttpModule } from '@angular/http';

import { BusinessRuleService } from '../rule/business-rule.service';
import { MetaformService } from './metaform.service';
import { TrackerService } from '../tracker/tracker.service';

import { MetaformDisplayComponent } from './metaform-display.component';

describe('MetaformDisplayComponent', () => {
  let component: MetaformDisplayComponent;
  let fixture: ComponentFixture<MetaformDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      declarations: [ MetaformDisplayComponent ],
      providers: [TrackerService, MetaformService, BusinessRuleService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetaformDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
