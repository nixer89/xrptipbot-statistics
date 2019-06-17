import {NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {HttpClientModule} from '@angular/common/http';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
//import {LocationStrategy,HashLocationStrategy} from '@angular/common';
import {AppRoutes} from './app.routes';

// Angular Material
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// PrimeNG
import {ButtonModule} from 'primeng/primeng';
import {CheckboxModule} from 'primeng/primeng';
import {InputTextModule} from 'primeng/primeng';
import {MessagesModule} from 'primeng/primeng';
import {PaginatorModule} from 'primeng/primeng';
import {SpinnerModule} from 'primeng/primeng';
import {TableModule} from 'primeng/table';
import {ToolbarModule} from 'primeng/primeng';
import {CardModule} from 'primeng/primeng';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {ToggleButtonModule} from 'primeng/togglebutton';
import {ChartModule} from 'primeng/chart';
import {DropdownModule} from 'primeng/dropdown';
import {CalendarModule} from 'primeng/calendar';
import {DialogModule} from 'primeng/dialog';
import {TooltipModule} from 'primeng/tooltip';

//App
import {AppComponent} from './app.component';
import {AppTopbarComponent}  from './components/topbar';
import {AppFooterComponent}  from './components/footer';
import {DashboardUserComponent} from './components/dashboardUser';
import {DashboardOverallComponent} from './components/dashboardOverall';
import {UserTableComponent} from './components/userTable';
import {TransactionTableComponent} from './components/transactionTable';
import {TopTipperFullTableComponent} from './components/topTipperFullTable';

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

//Special
import { ClipboardModule } from 'ngx-clipboard';

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
    MainComponent,
    UserStatisticsComponent,
    OverallStatisticsComponent
  ],
  imports: [
    BrowserModule,
    FlexLayoutModule,
    AppRoutes,
    HttpClientModule,
    BrowserAnimationsModule,
    //Angular Material:
    MatToolbarModule,
    MatButtonModule,
    MatTooltipModule,
    MatSnackBarModule,
    // PrimeNG:
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    MessagesModule,
    PaginatorModule,
    SpinnerModule,
    TableModule,
    ToolbarModule,
    CardModule,
    ProgressSpinnerModule,
    ToggleButtonModule,
    ChartModule,
    DropdownModule,
    CalendarModule,
    DialogModule,
    TooltipModule,
    ClipboardModule
  ],
  providers: [AppService,ApiService,UserStatisticsService,OverallStatisticsService,GeneralStatisticsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
