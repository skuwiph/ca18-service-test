import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { TrackerService } from './shared/tracker/tracker.service';
import { ApplicationService } from './shared/application/application.service';
import { IBusinessRuleData } from './shared/rule/business-rule';

@Component({
    templateUrl: './step.component.html',
    styleUrls: ['./step.component.css']
})
export class StepComponent implements OnInit, OnDestroy {
    
    constructor(
        private route: ActivatedRoute,
        private router: Router,        
        private applicationService: ApplicationService,
        private tracker: TrackerService 
    ) {}

    ngOnInit(){
        console.log(`Step:ngOnInit`);
    }

    ngOnDestroy() {
        console.log(`Step:ngOnDestroy`);
    }
}
