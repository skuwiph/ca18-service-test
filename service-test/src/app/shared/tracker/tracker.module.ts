import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// NgBootstrap
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Import feature components, services and filters here
import { TrackerButtonComponent } from './tracker-button.component';
import { TrackerProgressComponent } from './tracker-progress.component';

import { TrackerService } from './tracker.service';

@NgModule({
    // Inputs
    imports: [
        NgbModule,
        CommonModule,
    ],
    // Outputs
    declarations: [
        TrackerButtonComponent,
        TrackerProgressComponent,
    ],
    // Services
    providers: [
        TrackerService        
    ],
    // Exports - if we export a component from here, we will probably import it into another module (either feature or root)
    exports: [
        TrackerButtonComponent,
        TrackerProgressComponent,
    ]
})
export class TrackerModule {

}