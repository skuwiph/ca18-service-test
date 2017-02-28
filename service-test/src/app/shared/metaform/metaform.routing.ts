import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MetaformDisplayComponent } from './metaform-display.component';

const routes: Routes = [
//   { path: '**/:formName', component: MetaformDisplayComponent },
  { path: ':formName', component: MetaformDisplayComponent }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);