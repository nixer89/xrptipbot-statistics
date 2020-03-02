import {Routes,RouterModule} from '@angular/router';
import {ModuleWithProviders} from '@angular/core';

import {InfoComponent} from './pages/info';
import {TermsComponent} from './pages/terms';
import {PrivacyComponent} from './pages/privacy';
import {UserStatisticsComponent} from './pages/userstatistics';
import {OverallStatisticsComponent} from './pages/overallstatistics';
import {FeedComponent} from './pages/feed';
import {ILPStatisticsComponent} from './pages/ilpstatistics'
import {ILPStatisticsPayComponent} from './pages/ilpstatistics-pay'
import {SettingsDialogComponent} from './pages/settings';

export const routes:Routes = [
    {path: '', component: FeedComponent},
    {path: 'feed', component: FeedComponent},
    {path: 'overallstatistics', component: OverallStatisticsComponent},
    {path: 'userstatistics', component: UserStatisticsComponent},
    {path: 'ilp', component: ILPStatisticsComponent},
    {path: 'ilp-pay', component: ILPStatisticsPayComponent,},
    {path: 'info', component: InfoComponent},
    {path: 'terms', component: TermsComponent},
    {path: 'privacy', component: PrivacyComponent},
    {path: 'settings', component: SettingsDialogComponent},
    {path: '**', redirectTo: ''}
];

export const AppRoutes: ModuleWithProviders = RouterModule.forRoot(routes);
