import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IntroStepComponent } from './intro-step.component';
import { RewardStepComponent } from './reward-step.component';

const routes: Routes = [
//   { path: '**/:formName', component: MetaformDisplayComponent },
  { path: ':formName/intro', component: IntroStepComponent },
  { path: ':formName/finished', component: RewardStepComponent }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);