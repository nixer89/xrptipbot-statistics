import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { OverallStatisticsService } from '../services/overallstatistics.service';
import { GeneralStatisticsService } from '../services/generalstatistics.service'
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpParams } from '@angular/common/http';
import { ClipboardService } from 'ngx-clipboard'
import * as formatUtil from '../util/formattingUtil';
import{ GoogleAnalyticsService } from '../services/google-analytics.service';
import { Observable, Subscription } from 'rxjs';
import { TOUCH_BUFFER_MS } from '@angular/cdk/a11y';

@Component({
    selector: "ilp",
    templateUrl: "ilp.html"
})
export class ILPOverallComponent implements OnInit, OnDestroy {

    @Input()
    userHasPaid: Observable<any>;
    private userHasPaidSubscription: Subscription;

    //stats
    executionTimeoutStats;
    processingStats:boolean = false;
    overallStats:any[]=[
        {label: "All networks", count:0, xrp: 0},
        {label: "On Twitter", count:0, xrp:0},
        {label: "On Coil", count:0, xrp:0},
        {label: "On Reddit", count:0, xrp:0},
        {label: "On Discord", count:0, xrp:0},
    ];

    statsHeader:string = "Top active XRPTipBot ILP users";
    useDateRange:boolean = false;
    fromDate:Date;
    toDate:Date;

    topIlpReceived:any[] = [];
    topIlpReceivedTwitter:any[] = [];
    topIlpReceivedReddit:any[] = [];
    topIlpReceivedDiscord:any[] = [];
    topIlpReceivedCoil:any[] = [];

    constructor(private overAllStatistics: OverallStatisticsService,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar,
        private clipboard: ClipboardService,
        private googleAnalytics: GoogleAnalyticsService,
        private generalStats: GeneralStatisticsService) {

        this.initWithZeroValues();        
    }

    async ngOnInit() {
        this.userHasPaidSubscription = this.userHasPaid.subscribe(userHasPaid => {
            //console.log("account info changed received: " + JSON.stringify(accountData));
            if(userHasPaid) {
                this.userPaid();
            } else {
                this.initWithZeroValues();
            }
        });

        let fromDateParam = this.route.snapshot.queryParamMap.get('from_date');
        let toDateParam = this.route.snapshot.queryParamMap.get('to_date');

        if(fromDateParam && fromDateParam.trim().length>0 && Date.parse(fromDateParam)>0)
            this.fromDate = new Date(fromDateParam);

        if(toDateParam && toDateParam.trim().length>0 && Date.parse(toDateParam)>0)
            this.toDate = new Date(toDateParam)

        if(this.fromDate && this.toDate) {
            this.useDateRange = true;
            this.googleAnalytics.analyticsEventEmitter("direct_link", "ilp", "ilp_direct_link");
        }
            
        await this.refreshAll();

    }

    ngOnDestroy() {
        if(this.userHasPaidSubscription)
            this.userHasPaidSubscription.unsubscribe();
    }

    refreshStatsWithTimeout() {
        if(this.executionTimeoutStats) clearTimeout(this.executionTimeoutStats);
        
        this.executionTimeoutStats = setTimeout(()=> this.refreshStats(),2500);
    }

    async refreshAll() {
        console.time("refreshAll");
        await this.refreshStats();
        console.timeEnd("refreshAll");
        this.googleAnalytics.analyticsEventEmitter("refresh_ilp", "ilp", "ilp_refresh_ilp");
    }

    fillData(index:number, filter:string, receivers:any[]) {
        let networkXrp:number=0;
        let filteredArray = receivers.filter(user => user.network==filter);
        this.overallStats[index].count = filteredArray.length;

        filteredArray.forEach(user => networkXrp+=parseInt(user.amount))
        this.overallStats[index].xrp = (networkXrp/1000000).toFixed(3);
    }

    async refreshStats() {
        this.processingStats = true;
        if((!this.useDateRange || (this.useDateRange && this.fromDate && this.toDate && this.fromDate <= this.toDate))) {
            
            let allReceivers = await this.overAllStatistics.getOverallStatsILP(this.useDateRange ? this.fromDate : null, this.useDateRange ? this.toDate : null);

            if(allReceivers) {

                let overallReceived = 0;
                allReceivers.forEach(user => overallReceived+=user.amount);

                this.overallStats[0].xrp = (overallReceived/1000000).toFixed(3);
                this.overallStats[0].count = allReceivers.length;

                this.fillData(1, 'twitter', allReceivers);
                this.fillData(2, 'coil', allReceivers);
                this.fillData(3, 'reddit', allReceivers);
                this.fillData(4, 'discord', allReceivers);

                allReceivers = this.changeDropsToXrp(allReceivers);
                this.topIlpReceived = allReceivers.slice(0,9);
                this.topIlpReceivedCoil = allReceivers.filter(user => user.network === 'coil' && user.amount > 0).slice(0,9);
                this.topIlpReceivedDiscord = allReceivers.filter(user => user.network === 'discord' && user.amount > 0).slice(0,9);
                this.topIlpReceivedReddit = allReceivers.filter(user => user.network === 'reddit' && user.amount > 0).slice(0,9);
                this.topIlpReceivedTwitter = allReceivers.filter(user => user.network === 'twitter' && user.amount > 0).slice(0,9);
            }
        } else {
            this.initWithZeroValues();
        }

        this.processingStats = false;
    }

    changeDropsToXrp(tipper:any[]): any[] {
        for(let i = 0; i < tipper.length; i++) {
            tipper[i].amount = (tipper[i].amount/1000000).toFixed(3);
        }

        return tipper;
    }

    initStatsWithZeroValues() {
        this.overallStats=[
            {label: "All XRPTipBot 'networks'", count:0, xrp: 0},
            {label: "Twitter", count:0, xrp:0},
            {label: "Coil", count:0, xrp:0},
            {label: "Reddit", count:0, xrp:0},
            {label: "Discord", count:0, xrp:0},
        ];
    }

    initWithZeroValues() {
        this.initStatsWithZeroValues();
    }

    getOptionalDateFilter(): string {
        if(this.useDateRange && this.fromDate && this.toDate)
            return this.generalStats.constructOptionalFilter(this.fromDate, this.toDate);
        else
            return "";
    }

    copy2Clipboard() {
        let params = new HttpParams()

        //console.log(JSON.stringify(window.location));
        let url = window.location.origin+'/ilp?'
        
        if(this.useDateRange) {
            if(this.fromDate)
                params = params.set('from_date',this.fromDate.toISOString());

            if(this.toDate)
                params = params.set('to_date',this.toDate.toISOString());
        }

        //console.log('params: ' +params.toString())

        if(this.clipboard.isSupported) {
            this.clipboard.copyFromContent(url+params.toString());
            this.snackBar.open("The link to this statistics page has been copied to your clipboard.", null, {duration: 3000});
        }

        this.googleAnalytics.analyticsEventEmitter("copy_link", "ilp", "ilp_copy_link");
    }

    dateToLocaleStringEuropeTime(date: Date): string {
        return formatUtil.dateToStringEuropeForLocale(date) + " GMT+1";
    }

    userPaid() {
        console.log("userPaid");
        this.refreshAll();
    }
}
