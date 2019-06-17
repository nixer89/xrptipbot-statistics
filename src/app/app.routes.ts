import {Routes,RouterModule} from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import {MainComponent} from './pages/main';
import {UserStatisticsComponent} from './pages/userstatistics';
import {OverallStatisticsComponent} from './pages/overallstatistics'

export const routes:Routes = [
    {path: '', component: MainComponent},
    {path: 'overallstatistics', component: OverallStatisticsComponent},
    {path: 'userstatistics', component: UserStatisticsComponent}
];

export const AppRoutes: ModuleWithProviders = RouterModule.forRoot(routes);