import {NgModule}      from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import {HttpClientModule}    from '@angular/common/http';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
//import {LocationStrategy,HashLocationStrategy} from '@angular/common';
import {AppRoutes} from './app.routes';

// Angular Material
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';

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

//App
import {AppComponent} from './app.component';
import {AppTopbarComponent}  from './components/topbar';
import {AppFooterComponent}  from './components/footer';
import {DashboardUserComponent} from './components/dashboardUser';
import {DashboardOverallComponent} from './components/dashboardOverall';
import {UserTableComponent} from './components/userTable';
import {TransactionTableComponent} from './components/transactionTable';
import {TopTipperFullTableComponent} from './components/topTipperFullTable';
import {TopTipperReceivedComponent} from './components/toptipper/topTipperReceived';

//my components
import {MainComponent} from './pages/main';
import {UserStatisticsComponent} from './pages/userstatistics';
import {OverallStatisticsComponent} from './pages/overallstatistics';

//my services
import {AppService} from './services/app.service';
import {ApiService} from './services/api.service';
import {UserStatisticsService} from './services/userstatistics.service';
import {OverallStatisticsService} from './services/overallstatistics.service';
import {GeneralStatisticsService} from './services/generalstatistics.service'

@NgModule({
  declarations: [
    AppComponent,
    AppTopbarComponent,
    AppFooterComponent,
    DashboardUserComponent,
    DashboardOverallComponent,
    UserTableComponent,
    TransactionTableComponent,
    TopTipperFullTableComponent,
    TopTipperReceivedComponent,
    MainComponent,
    UserStatisticsComponent,
    OverallStatisticsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    AppRoutes,
    HttpClientModule,
    BrowserAnimationsModule,
    //Angular Material:
    MatToolbarModule,
    MatButtonModule,
    MatTooltipModule,
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
  ],
  providers: [AppService,ApiService,UserStatisticsService,OverallStatisticsService,GeneralStatisticsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
