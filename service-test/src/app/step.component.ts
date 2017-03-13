import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { TrackerService, ITrackedProcess } from './shared/tracker/tracker.service';
import { ApplicationService } from './shared/application/application.service';
import { IBusinessRuleData } from './shared/rule/business-rule';

@Component({
    templateUrl: './step.component.html',
    styleUrls: ['./step.component.css']
})
export class StepComponent implements OnInit, OnDestroy, ITrackedProcess {
    
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
        this.tracker.addProcessHost(this);

        this.tracker.loadSequenceForApplication(1, true);
        this.tracker.findFirstMatchingSequence(this.applicationService);
    }

    ngOnDestroy() {
        this.tracker.removeProcessHost(this);
    }

    processTotalSteps(): number {
        return 1;
    }

    processCurrentStep(): number {
        return 1;
    }
    
    enableNext(): boolean { return true; }
    enablePrevious(): boolean { return true; }

    handleNavigateNext(): boolean {
        return false;
    }

    handleNavigatePrevious(): boolean {
        return false;
    }
    
    getBusinessRuleDataForTracker() : IBusinessRuleData {
        return this.applicationService;
    }

    getActiveRoute(): ActivatedRoute { console.debug(`Returning ActivatedRoute`); return this.route; }
    getRouter() : Router { return this.router; }

    
}
