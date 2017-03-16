import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateApplicationComponent } from './create-application.component';

const routes: Routes = [
//   { path: '**/:formName', component: MetaformDisplayComponent },
    { path: 'create', component: CreateApplicationComponent }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);