/* tslint:disable:no-unused-variable */

import { HttpModule } from '@angular/http';

import { TestBed, async, inject } from '@angular/core/testing';
import { TrackerService } from './tracker.service';

describe('TrackerService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TrackerService],
            imports: [HttpModule]
        });
    });

    it('should ...', inject([TrackerService], (service: TrackerService) => {
        expect(service).toBeTruthy();
    }));

    it('should load a sequence for a passed application', inject([TrackerService], (service: TrackerService) => {
        service.loadTasksForApplication(1);
        expect(service.applicationTasks).toBeTruthy();
    }));

    it('should throw an error if getFirstTask is called without pre-conditions being met', inject([TrackerService], (service: TrackerService) => {
        expect(function() { service.getFirstTask(); }).toThrow( new Error("No tasks loaded for the current application!"));
    }));
});
