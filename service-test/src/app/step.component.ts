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
    ) {
        console.log("Got app and tracker service");
    }

    ngOnInit(){
        console.log(`Step:Init`);
    }

    ngOnDestroy() {
    }
}
