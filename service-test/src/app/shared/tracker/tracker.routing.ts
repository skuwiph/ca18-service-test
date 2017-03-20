import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TaskIntroComponent } from './task-intro.component';
import { TaskOutroComponent } from './task-outro.component';

const routes: Routes = [
   { path: ':taskName/intro', component: TaskIntroComponent },
   { path: ':taskName/finished', component: TaskOutroComponent }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);