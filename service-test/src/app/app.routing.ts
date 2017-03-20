import { ModuleWithProviders } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { AppComponent } from './app.component';
import { StepComponent } from './step.component';

const routes: Routes  = [
    { path: '', redirectTo: 'home', pathMatch: 'full'},    
    { path: 'home', component: StepComponent },
    { path: 'form', loadChildren: './shared/metaform/metaform.module#MetaformModule' },
    { path: 'application', loadChildren: './application/application.module#ApplicationModule' }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
