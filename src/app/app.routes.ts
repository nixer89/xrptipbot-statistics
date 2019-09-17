import {Routes,RouterModule} from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import {InfoComponent} from './pages/info';
import {TermsComponent} from './pages/terms';
import {PrivacyComponent} from './pages/privacy';
import {UserStatisticsComponent} from './pages/userstatistics';
import {OverallStatisticsComponent} from './pages/overallstatistics';
import {FeedComponent} from './pages/feed';
import {ILPStatisticsComponent} from './pages/ilpstatistics'
import {SettingsDialogComponent} from './pages/settings';
import {ButtonURLsComponent} from './pages/buttonURLs'

export const routes:Routes = [
    {path: '', redirectTo: 'feed', pathMatch: 'full'},
    {path: 'feed', component: FeedComponent},
    {path: 'overallstatistics', component: OverallStatisticsComponent},
    {path: 'userstatistics', component: UserStatisticsComponent},
    {path: 'userstatistics', component: UserStatisticsComponent},
    {path: 'ilp', component: ILPStatisticsComponent},
    {path: 'info', component: InfoComponent},
    {path: 'terms', component: TermsComponent},
    {path: 'privacy', component: PrivacyComponent},
    {path: 'settings', component: SettingsDialogComponent},
    {path: 'buttonURLs', component: ButtonURLsComponent},
    {path: '**', component: FeedComponent}
];

export const AppRoutes: ModuleWithProviders = RouterModule.forRoot(routes);
