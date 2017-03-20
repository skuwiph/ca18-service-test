import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateApplicationComponent } from './create-application.component';
import { CreateApplicationStep2Component } from './create-application-step2.component';

const routes: Routes = [
//   { path: '**/:formName', component: MetaformDisplayComponent },
    { path: 'create', component: CreateApplicationComponent },
    { path: 'create/step2', component: CreateApplicationStep2Component }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);