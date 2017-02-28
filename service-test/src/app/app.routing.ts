import { ModuleWithProviders } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { AppComponent } from './app.component';
import { StepComponent } from './step.component';

const routes: Routes  = [
    { path: '', redirectTo: 'step', pathMatch: 'full'},    
    { path: 'step', component: StepComponent },
    { path: 'form', loadChildren: './shared/metaform/metaform.module#MetaformModule' },
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
