import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
//import {LocationStrategy,HashLocationStrategy} from '@angular/common';
import {AppRoutes} from './app.routes';

// Angular Material
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// PrimeNG
import {AccordionModule} from 'primeng/primeng';
import {AutoCompleteModule} from 'primeng/primeng';
import {ButtonModule} from 'primeng/primeng';
import {CaptchaModule} from 'primeng/primeng';
import {CheckboxModule} from 'primeng/primeng';
import {ConfirmDialogModule} from 'primeng/primeng';
import {FieldsetModule} from 'primeng/primeng';
import {GrowlModule} from 'primeng/primeng';
import {InputMaskModule} from 'primeng/primeng';
import {InputSwitchModule} from 'primeng/primeng';
import {InputTextModule} from 'primeng/primeng';
import {InputTextareaModule} from 'primeng/primeng';
import {MenuModule} from 'primeng/primeng';
import {MenubarModule} from 'primeng/primeng';
import {MessagesModule} from 'primeng/primeng';
import {PaginatorModule} from 'primeng/primeng';
import {PanelModule} from 'primeng/primeng';
import {PasswordModule} from 'primeng/primeng';
import {ProgressBarModule} from 'primeng/primeng';
import {RadioButtonModule} from 'primeng/primeng';
import {ScrollPanelModule} from 'primeng/scrollpanel';
import {SpinnerModule} from 'primeng/primeng';
import {TableModule} from 'primeng/table';
import {TabMenuModule} from 'primeng/primeng';
import {ToolbarModule} from 'primeng/primeng';
import {CardModule} from 'primeng/primeng';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {ToggleButtonModule} from 'primeng/togglebutton';
import {ChartModule} from 'primeng/chart';
import {DropdownModule} from 'primeng/dropdown';
import {CalendarModule} from 'primeng/calendar';
import {SidebarModule} from 'primeng/sidebar';
import {DialogModule} from 'primeng/dialog';
import {TooltipModule} from 'primeng/tooltip';

//App
import {AppComponent} from './app.component';
import {AppTopbarComponent} from './components/topbar';
import {AppFooterComponent} from './components/footer';
import {DashboardUserComponent} from './components/dashboardUser';
import {DashboardOverallComponent} from './components/dashboardOverall';
import {UserTableComponent} from './components/userTable';
import {TransactionTableComponent} from './components/transactionTable';
import {TransactionTableDialogComponent} from './components/transactionTableDialog';
import {TopTipperFullTableComponent} from './components/topTipperFullTable';
import {ILPOverallComponent} from './components/ilp';
import {XummPaymentComponent} from './components/xummPaymentRequest';
import {XummSignComponent} from './components/xummSignRequest';
import {SettingsDialogComponent} from './pages/settings';

//my components
import {InfoComponent} from './pages/info';
import {TermsComponent} from './pages/terms';
import {PrivacyComponent} from './pages/privacy';
import {UserStatisticsComponent} from './pages/userstatistics';
import {OverallStatisticsComponent} from './pages/overallstatistics';
import {FeedComponent} from './pages/feed';
import {ILPStatisticsComponent} from './pages/ilpstatistics';
import {ILPStatisticsPayComponent} from './pages/ilpstatistics-pay';
import {environment} from '../environments/environment';

//my services
import {AppService} from './services/app.service';
import {ApiService} from './services/api.service';
import {XummService} from './services/xumm.service';
import {UserStatisticsService} from './services/userstatistics.service';
import {OverallStatisticsService} from './services/overallstatistics.service';
import {GeneralStatisticsService} from './services/generalstatistics.service';
import {GoogleAnalyticsService} from './services/google-analytics.service';

//Special
import { ClipboardModule } from 'ngx-clipboard';
import { LocalStorageModule } from 'angular-2-local-storage';
import { DeviceDetectorModule } from 'ngx-device-detector';

@NgModule({
  declarations: [
    AppComponent,
    AppTopbarComponent,
    AppFooterComponent,
    DashboardUserComponent,
    DashboardOverallComponent,
    UserTableComponent,
    TransactionTableComponent,
    TransactionTableDialogComponent,
    TopTipperFullTableComponent,
    ILPOverallComponent,
    XummPaymentComponent,
    XummSignComponent,
    InfoComponent,
    TermsComponent,
    PrivacyComponent,
    UserStatisticsComponent,
    OverallStatisticsComponent,
    FeedComponent,
    ILPStatisticsComponent,
    ILPStatisticsPayComponent,
    SettingsDialogComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutes,
    HttpClientModule,
    BrowserAnimationsModule,
    //Angular Material:
    MatToolbarModule,
    MatButtonModule,
    MatTooltipModule,
    MatSnackBarModule,
    // PrimeNG:
    AccordionModule,
    AutoCompleteModule,
    ButtonModule,
    CaptchaModule,
    CheckboxModule,
    ConfirmDialogModule,
    FieldsetModule,
    GrowlModule,
    InputMaskModule,
    InputSwitchModule,
    InputTextModule,
    InputTextareaModule,
    MenuModule,
    MenubarModule,
    MessagesModule,
    PaginatorModule,
    PanelModule,
    PasswordModule,
    ProgressBarModule,
    RadioButtonModule,
    ScrollPanelModule,
    SpinnerModule,
    TableModule,
    TabMenuModule,
    ToolbarModule,
    CardModule,
    ProgressSpinnerModule,
    ToggleButtonModule,
    ChartModule,
    DropdownModule,
    CalendarModule,
    SidebarModule,
    DialogModule,
    TooltipModule,
    ClipboardModule,
    LocalStorageModule.forRoot({ prefix: 'xrptipbot-stats', storageType: 'localStorage' }),
    //special
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production, registrationStrategy: 'registerImmediately' }),
    DeviceDetectorModule.forRoot()
  ],
  providers: [
    AppService,
    ApiService,
    XummService,
    UserStatisticsService,
    OverallStatisticsService,
    GeneralStatisticsService,
    GoogleAnalyticsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
