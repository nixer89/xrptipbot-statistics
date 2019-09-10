import { Component, OnInit } from "@angular/core";
import { GeneralStatisticsService } from '../services/generalstatistics.service'
import { OverallStatisticsService } from '../services/overallstatistics.service';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpParams } from '@angular/common/http';
import { ClipboardService } from 'ngx-clipboard'
import * as formatUtil from '../util/formattingUtil';

@Component({
    selector: "ilp",
    templateUrl: "ilp.html"
})
export class ILPOverallComponent implements OnInit {

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
        private generalStatistics: GeneralStatisticsService,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar,
        private clipboard: ClipboardService) {

        this.initWithZeroValues();        
    }

    async ngOnInit() {
        let fromDateParam = this.route.snapshot.queryParamMap.get('from_date');
        let toDateParam = this.route.snapshot.queryParamMap.get('to_date');

        if(fromDateParam && fromDateParam.trim().length>0 && Date.parse(fromDateParam)>0)
                this.fromDate = new Date(fromDateParam);

        if(toDateParam && toDateParam.trim().length>0 && Date.parse(toDateParam)>0)
            this.toDate = new Date(toDateParam)

        if(this.fromDate && this.toDate)
            this.useDateRange = true;
            
        await this.refreshAll();
    }

    refreshStatsWithTimeout() {
        if(this.executionTimeoutStats) clearTimeout(this.executionTimeoutStats);
        
        this.executionTimeoutStats = setTimeout(()=> this.refreshStats(),2500);
    }

    async refreshAll() {
        console.time("refreshAll");
        await this.refreshStats();
        console.timeEnd("refreshAll");
    }

    fillData(index:number, filter:string, receivers:any[]) {
        let networkXrp:number=0;
        let filteredArray = receivers.filter(user => user.network==filter);
        this.overallStats[index].count = filteredArray.length;

        filteredArray.forEach(user => networkXrp+=parseInt(user.amount))
        this.overallStats[index].xrp = networkXrp;
    }

    async refreshStats() {
        this.processingStats = true;
        if((!this.useDateRange || (this.useDateRange && this.fromDate && this.toDate && this.fromDate <= this.toDate))) {
            
            let allReceivers = await this.overAllStatistics.getOverallStatsILP(this.fromDate, this.toDate);

            if(allReceivers) {
                console.log("allReceivers: " +JSON.stringify(allReceivers[0]));

                let overallReceived = 0;
                allReceivers.forEach(user => overallReceived+=parseInt(user.amount))

                this.overallStats[0].xrp = overallReceived.toFixed(0);
                this.overallStats[0].count = allReceivers.length;

                this.fillData(1, 'twitter', allReceivers);
                this.fillData(2, 'coil', allReceivers);
                this.fillData(3, 'reddit', allReceivers);
                this.fillData(4, 'discord', allReceivers);

                this.topIlpReceived = allReceivers.slice(0,9);
                this.topIlpReceivedCoil = allReceivers.filter(user => user.network === 'coil').slice(0,9);
                this.topIlpReceivedDiscord = allReceivers.filter(user => user.network === 'discord').slice(0,9);
                this.topIlpReceivedReddit = allReceivers.filter(user => user.network === 'reddit').slice(0,9);
                this.topIlpReceivedTwitter = allReceivers.filter(user => user.network === 'twitter').slice(0,9);

                console.log(JSON.stringify(this.topIlpReceivedDiscord[0]));
            }
        } else {
            this.initWithZeroValues();
        }
        this.processingStats = false;
    }

    initStatsWithZeroValues() {
        this.overallStats=[
            {label: "All networks", count:0, xrp: 0},
            {label: "On Twitter", count:0, xrp:0},
            {label: "On Coil", count:0, xrp:0},
            {label: "On Reddit", count:0, xrp:0},
            {label: "On Discord", count:0, xrp:0},
        ];
    }

    initWithZeroValues() {
        this.initStatsWithZeroValues();
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
    }

    dateToLocaleStringEuropeTime(date: Date): string {
        return formatUtil.dateToStringEuropeForLocale(date) + " GMT+2";
    }
}
