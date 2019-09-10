import {Routes,RouterModule} from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import {InfoComponent} from './pages/info';
import {UserStatisticsComponent} from './pages/userstatistics';
import {OverallStatisticsComponent} from './pages/overallstatistics';
import {FeedComponent} from './pages/feed';
import {ILPStatisticsComponent} from './pages/ilpstatistics'

export const routes:Routes = [
    {path: '', redirectTo: 'feed', pathMatch: 'full'},
    {path: 'feed', component: FeedComponent},
    {path: 'overallstatistics', component: OverallStatisticsComponent},
    {path: 'userstatistics', component: UserStatisticsComponent},
    {path: 'userstatistics', component: UserStatisticsComponent},
    {path: 'ilp', component: ILPStatisticsComponent},
    {path: 'info', component: InfoComponent},
    {path: '**', component: FeedComponent}
];

export const AppRoutes: ModuleWithProviders = RouterModule.forRoot(routes);