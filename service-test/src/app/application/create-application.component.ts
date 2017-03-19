import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';

import { Observable } from 'rxjs/Observable';

import { TrackerService } from '../shared/tracker/tracker.service';
import { ApplicationService } from '../shared/application/application.service';
import { IBusinessRuleData } from '../shared/rule/business-rule';

@Component({
    templateUrl: './create-application.component.html'
})
export class CreateApplicationComponent implements OnInit, OnDestroy {
    
    constructor(
        private route: ActivatedRoute,
        private router: Router,        
        private applicationService: ApplicationService,
        private tracker: TrackerService 
    ) {
        console.log("Got app and tracker service");
    }

    ngOnInit(){
        var url =this.route.snapshot.url.join('');
        console.info(`Route: ${url}`);

        console.log(`CreateApplicationComponent:Init`);
        //console.info(`Tracker for route '${parts}' step status is: ${this.tracker.applicationTasks.activeTask.taskStatus}`);
    }

    ngOnDestroy() {
    }
}