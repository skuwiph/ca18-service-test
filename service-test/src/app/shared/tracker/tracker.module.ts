import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// NgBootstrap
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


import { routing } from './tracker.routing';

// Import feature components, services and filters here
import { TrackerButtonComponent } from './tracker-button.component';
import { TrackerProgressComponent } from './tracker-progress.component';
import { IntroStepComponent } from './intro-step.component';
import { RewardStepComponent } from './reward-step.component';

import { TrackerService } from './tracker.service';

@NgModule({
    // Inputs
    imports: [
        NgbModule,
        CommonModule,
        routing
    ],
    // Outputs
    declarations: [
        TrackerButtonComponent,
        TrackerProgressComponent,
        IntroStepComponent,
        RewardStepComponent
    ],
    // Services
    providers: [
        TrackerService        
    ],
    // Exports - if we export a component from here, we will probably import it into another module (either feature or root)
    exports: [
        TrackerButtonComponent,
        TrackerProgressComponent,
        IntroStepComponent,
        RewardStepComponent
    ]
})
export class TrackerModule {

}