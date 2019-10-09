import { Component, OnInit } from "@angular/core";
import { OverallStatisticsService } from '../services/overallstatistics.service';
import { GeneralStatisticsService } from '../services/generalstatistics.service';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpParams } from '@angular/common/http';
import { ClipboardService } from 'ngx-clipboard'
import { LocalStorageService } from 'angular-2-local-storage';
import * as formatUtil from '../util/formattingUtil';

@Component({
    selector: "dashboardOverall",
    templateUrl: "dashboardOverall.html"
})
export class DashboardOverallComponent implements OnInit {

    //All for User
    executionTimeoutAll;
    excludeBots:boolean = false;
    excludeCharities:boolean = false;
    excludeCoilSettlement:boolean = false;
    excludeCoilSettlementChart: boolean = false;

    //chart
    chartData: any;
    options:any;
    daysToReceive = 10;
    selectedDayOrWeek;
    daysOrWeeksDropDown;
    processingChart:boolean = false;
    executionTimeoutChart;

    //detailed transactions
    userFilter:string;
    toFilter:string;

    //stats
    executionTimeoutStats;
    processingStats:boolean = false;
    overallStats:any[]=[
        {label: "Sent Tips", count: 0, xrp:0},
        {label: "Deposits", count: 0, xrp:0},
        {label: "Withdrawals", count: 0, xrp:0},
    ];

    overallStatsByNetwork:any[]=[
        {label: "Twitter", count: 0, xrp:0},
        {label: "Discord", count: 0, xrp:0},
        {label: "Reddit", count: 0, xrp:0},
        {label: "App", count: 0, xrp:0},
        {label: "Button", count: 0, xrp:0},
    ];
    statsHeader:string = "Top active Users";
    useDateRange:boolean = true;
    fromDate:Date;
    toDate:Date;

    topTipperSent:any[] = [];
    topTipperReceived:any[] = [];
    topXRPSent:any[] = [];
    topXRPReceived:any[] = [];

    constructor(private overAllStatistics: OverallStatisticsService,
        private generalStats: GeneralStatisticsService,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar,
        private clipboard: ClipboardService,
        private localStorage: LocalStorageService) {

        this.daysOrWeeksDropDown = [
            {label:'Days', value:1},
            {label:'Weeks', value:7},
            {label:'Months', value: 31},
            {label:'Years', value: 366}
        ];

        this.selectedDayOrWeek = this.daysOrWeeksDropDown[0].value;
        this.initWithZeroValues();        
    }

    async ngOnInit() {

        this.toDate = new Date();

        this.fromDate = new Date();
        this.fromDate.setDate(1);
        this.fromDate = this.generalStats.setZeroTime(this.fromDate)

        this.excludeBots = this.localStorage.get("excludeBots");
        this.excludeCharities = this.localStorage.get("excludeCharities");
        this.excludeCoilSettlement = this.localStorage.get("excludeCoil");
        this.excludeCoilSettlementChart = this.localStorage.get("excludeCoil");

        this.route.queryParams.subscribe(params => {
            let fromDateParam = params.from_date;
            let toDateParam = params.to_date;
            let excludeBotsParam = params.excludeBots;
            let excludeCharitiesParam = params.excludeCharities;
            let excludeCoil = params.excludeCoilSettlement;
            //console.log("param map: " + JSON.stringify(this.route.snapshot.queryParamMap));
            if(fromDateParam || toDateParam || excludeBotsParam || excludeCharitiesParam || excludeCoil) {
                this.initWithZeroValues();

                if(fromDateParam && fromDateParam.trim().length>0 && Date.parse(fromDateParam)>0)
                    this.fromDate = new Date(fromDateParam);
                else if(!this.useDateRange)
                    this.fromDate = null;

                if(toDateParam && toDateParam.trim().length>0 && Date.parse(toDateParam)>0)
                    this.toDate = new Date(toDateParam);
                else if(!this.useDateRange)
                    this.toDate = null;
                
                if(this.fromDate && this.toDate)
                    this.useDateRange = (this.fromDate != null && this.toDate != null);
                
                this.excludeBots = (excludeBotsParam == 'true');
                this.excludeCharities = (excludeCharitiesParam == 'true');
                this.excludeCoilSettlement = (excludeCoil == 'true');

                
                    
            }

            this.refreshAll();
        });
    }

    refreshStatsWithTimeout() {
        if(this.executionTimeoutStats) clearTimeout(this.executionTimeoutStats);
        
        this.executionTimeoutStats = setTimeout(()=> this.refreshStats(),2500);
    }

    async refreshAll() {
        console.time("refreshAll");
        let promises:any[] = [this.refreshStats(), this.refreshChart()]
        await Promise.all(promises);
        console.timeEnd("refreshAll");
    }

    async refreshStats() {
        this.processingStats = true;
        if((!this.useDateRange || (this.useDateRange && this.fromDate && this.toDate && this.fromDate <= this.toDate))) {
            let promises:any[] = [];
            promises.push(this.generalStats.getTopTipper(this.useDateRange ? this.fromDate:null, this.useDateRange ? this.toDate:null, 10, null, this.excludeBots, this.excludeCharities,this.excludeCoilSettlement));
            promises.push(this.overAllStatistics.getOverallStats(this.useDateRange ? this.fromDate:null, this.useDateRange ? this.toDate:null, this.excludeBots, this.excludeCharities,this.excludeCoilSettlement));
            promises.push(this.overAllStatistics.getOverallStatsByNetwork(this.useDateRange ? this.fromDate:null, this.useDateRange ? this.toDate:null, this.excludeBots, this.excludeCharities,this.excludeCoilSettlement));

            let promiseResult = await Promise.all(promises);

            let topTipper:any = promiseResult[0];
            let stats:number[] = promiseResult[1];
            let statsByNetwork:number[] = promiseResult[2];

            //console.log("user stats result in dashboard: " + JSON.stringify(stats));
            if(stats) {
                this.overallStats[0].count = stats[0] ? stats[0] : 0;
                this.overallStats[0].xrp = stats[1] ? stats[1].toFixed(0) : 0;
                this.overallStats[1].count = stats[2] ? stats[2] : 0;
                this.overallStats[1].xrp = stats[3] ? stats[3].toFixed(0) : 0;
                this.overallStats[2].count = stats[4] ? stats[4] : 0;
                this.overallStats[2].xrp = stats[5] ? stats[5].toFixed(0) : 0;
            }

            if(statsByNetwork) {
                this.overallStatsByNetwork[0].count = statsByNetwork[0] ? statsByNetwork[0] : 0;
                this.overallStatsByNetwork[0].xrp = statsByNetwork[1] ? statsByNetwork[1].toFixed(0) : 0;
                this.overallStatsByNetwork[1].count = statsByNetwork[2] ? statsByNetwork[2] : 0;
                this.overallStatsByNetwork[1].xrp = statsByNetwork[3] ? statsByNetwork[3].toFixed(0) : 0;
                this.overallStatsByNetwork[2].count = statsByNetwork[4] ? statsByNetwork[4] : 0;
                this.overallStatsByNetwork[2].xrp = statsByNetwork[5] ? statsByNetwork[5].toFixed(0) : 0;
                this.overallStatsByNetwork[3].count = statsByNetwork[6] ? statsByNetwork[6] : 0;
                this.overallStatsByNetwork[3].xrp = statsByNetwork[7] ? statsByNetwork[7].toFixed(0) : 0;
                this.overallStatsByNetwork[4].count = statsByNetwork[8] ? statsByNetwork[8] : 0;
                this.overallStatsByNetwork[4].xrp = statsByNetwork[9] ? statsByNetwork[9].toFixed(0) : 0;
            }

            //console.log("top tipper result in dashboard: " + JSON.stringify(topTipper));
            if(topTipper) {
                this.topTipperSent = topTipper[0] ? topTipper[0]: [];
                this.topTipperReceived = topTipper[1] ? topTipper[1]: [];
                this.topXRPSent = topTipper[2] ? topTipper[2]: [];
                this.topXRPReceived = topTipper[3] ? topTipper[3]: [];
                this.userFilter = topTipper[4];
                this.toFilter = topTipper[5];
            }
        } else {
            this.initWithZeroValues();
        }
        this.processingStats = false;
    }

    refreshChartWithTimeout() {
        if(Number.isInteger(this.daysToReceive)) {
            if(this.executionTimeoutChart) clearTimeout(this.executionTimeoutChart);
            
            this.executionTimeoutChart = setTimeout(()=> this.refreshChart(),1000);
        }
    }

    async refreshChart() {
        this.processingChart=true;
        let result:any = await this.generalStats.getChartData(this.daysToReceive, this.selectedDayOrWeek, true, true, false, false, false, false, null, this.excludeCoilSettlementChart);

        let dataSet:any[] = [];
        dataSet.push(result.sentTips.reverse());
        dataSet.push(result.sentXRP.reverse());
        dataSet.push(result.dateTimes.reverse());

        dataSet[0].push(0); //hidden value of 0 to always force the chart to start at 0 on y axis
        dataSet[1].push(0); //hidden value of 0 to always force the chart to start at 0 on y axis
        
        let labelsX = [];

        dataSet[2].forEach(jsonDate => {
            let from = new Date(jsonDate.from);
            let to = new Date(jsonDate.to);

            if(this.selectedDayOrWeek==1)
                labelsX.push(to.getDate()+"."+(to.getMonth()+1)+"."+to.getFullYear());
            else if(this.selectedDayOrWeek==366)
                labelsX.push(to.getFullYear());
            else
                labelsX.push(from.getDate()+"."+(from.getMonth()+1)+"."+from.getFullYear() + " - \n" + to.getDate()+"."+(to.getMonth()+1)+"."+to.getFullYear());
        })
    
        this.chartData = {
            labels: labelsX,
            datasets: [
                {
                    label: 'Sent tips',
                    data: dataSet[0].length > 1 ? dataSet[0] : [0,0,0,0,0,0,0,0,0,0,100],
                    backgroundColor: '#42A5F5',
                    borderColor: '#1E88E5',
                },
                {
                    label: 'Sent XRP',
                    data: dataSet[1].length > 1 ? dataSet[1] : [0,0,0,0,0,0,0,0,0,0,100],
                    backgroundColor: '#9CCC65',
                    borderColor: '#7CB342',
                },
                ]
        }

        this.options = {
            title: {
                display: true,
                text: 'Overall statistics for last ' + (dataSet[2].length) +' '+ this.getChartTextSelection(),
                fontSize: 16
            },
            legend: {
                position: 'top'
            }
        };
        this.processingChart=false;
    }

    getChartTextSelection(): string {
        if(this.selectedDayOrWeek==1) return "Days";
        else if(this.selectedDayOrWeek==7) return "Weeks";
        else if(this.selectedDayOrWeek==31) return "Months";
        else if(this.selectedDayOrWeek==366) return "Years";
    }

    initStatsWithZeroValues() {
        this.overallStats = [
            {label: "Sent Tips", count: 0, xrp:0},
            {label: "Deposits", count: 0, xrp:0},
            {label: "Withdrawals", count: 0, xrp:0},
        ];

        this.overallStatsByNetwork = [
            {label: "Twitter", count: 0, xrp:0},
            {label: "Discord", count: 0, xrp:0},
            {label: "Reddit", count: 0, xrp:0},
            {label: "App", count: 0, xrp:0},
            {label: "Button", count: 0, xrp:0},
        ];
    }

    initWithZeroValues() {
        this.initStatsWithZeroValues();
        
        let currentDate = new Date();

        this.topTipperSent = [];
        this.topTipperReceived = [];
        this.topXRPSent = [];
        this.topXRPReceived = [];

        this.chartData = {
        labels: [],
        datasets: [
            {
                label: 'Received XRP',
                data: [0,0,0,0,0,0,0,0,0,0,100]
            },
            {
                label: 'Received Tips',
                data: [0,0,0,0,0,0,0,0,0,0,100]
            },
            ]
        }

        for(let i=9;i>=0;i--) {
            currentDate.setDate(new Date().getDate()-(i*this.selectedDayOrWeek));
            this.chartData.labels.push(currentDate.toLocaleDateString());
        }

        this.options = {
            title: {
                display: true,
                text: 'Statistics for last 10 Days',
                fontSize: 16
            },
            legend: {
                position: 'top'
            }
        };
    }

    copy2Clipboard() {
        let params = new HttpParams()

        //console.log(JSON.stringify(window.location));
        let url = window.location.origin+'/overallstatistics?'
        
        if(this.useDateRange) {
            if(this.fromDate)
                params = params.set('from_date',this.fromDate.toISOString());

            if(this.toDate)
                params = params.set('to_date',this.toDate.toISOString());
        }

        if(this.excludeBots)
            params = params.set('excludeBots', this.excludeBots.toString());

        if(this.excludeCharities)
            params = params.set('excludeCharities', this.excludeCharities.toString());
        
        if(this.excludeCoilSettlement)
            params = params.set('excludeCoilSettlement', this.excludeCoilSettlement.toString());

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
