import { Component, OnInit } from "@angular/core";
import { OverallStatisticsService } from '../services/overallstatistics.service';
import { GeneralStatisticsService } from '../services/generalstatistics.service';
import { ApiService } from '../services/api.service';

@Component({
    selector: "dashboardOverall",
    templateUrl: "dashboardOverall.html"
})
export class DashboardOverallComponent implements OnInit {

    //All for User
    executionTimeoutAll;

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
    useDateRange:boolean = false;
    fromDate:Date;
    toDate:Date;

    topTipperSent:any[] = [];
    topTipperReceived:any[] = [];
    topXRPSent:any[] = [];
    topXRPReceived:any[] = [];

    constructor(private overAllStatistics: OverallStatisticsService, private api: ApiService, private generalStats: GeneralStatisticsService) {

        this.daysOrWeeksDropDown = [
            {label:'Days', value:1},
            {label:'Weeks', value:7}
        ];

        this.selectedDayOrWeek = this.daysOrWeeksDropDown[0].value;
        this.initWithZeroValues();        
    }

    async ngOnInit() {
        await this.refreshAll();
    }

    refreshStatsWithTimeout() {
        if(this.executionTimeoutStats) clearTimeout(this.executionTimeoutStats);
        
        this.executionTimeoutStats = setTimeout(()=> this.refreshStats(),1500);
    }

    async refreshAll() {
        let promises:any[] = [this.refreshStats(), this.refreshChart()]
        await Promise.all(promises);    
    }

    async refreshStats() {
        this.processingStats = true;
        if((!this.useDateRange || (this.useDateRange && this.fromDate && this.toDate && this.fromDate <= this.toDate))) {
            let stats:number[] = await this.overAllStatistics.getOverallStats(this.useDateRange ? this.fromDate:null, this.useDateRange ? this.toDate:null);
            let statsByNetwork:number[] = await this.overAllStatistics.getOverallStatsByNetwork(this.useDateRange ? this.fromDate:null, this.useDateRange ? this.toDate:null);
            let topTipper:any = await this.generalStats.getTopTipper(this.useDateRange ? this.fromDate:null, this.useDateRange ? this.toDate:null, 11, null);

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
            
            this.executionTimeoutChart = setTimeout(()=> this.refreshChart(),300);
        }
    }

    async refreshChart() {
        this.processingChart=true;
        let result:any = await this.generalStats.getChartData(this.daysToReceive, this.selectedDayOrWeek, true, true, false, false, false, false);

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
                labelsX.push(to.getUTCDate()+"."+(to.getUTCMonth()+1)+"."+to.getUTCFullYear());
            else
                labelsX.push(from.getUTCDate()+"."+(from.getUTCMonth()+1)+"."+from.getUTCFullYear() + " - \n" + to.getUTCDate()+"."+(to.getUTCMonth()+1)+"."+to.getUTCFullYear());
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
                text: 'Overall statistics for last ' + (dataSet[2].length) + (this.selectedDayOrWeek===1 ? ' Days' : ' Weeks'),
                fontSize: 16
            },
            legend: {
                position: 'top'
            }
        };
        this.processingChart=false;
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

    getNetworkURL(tipper:any): String {
        if(tipper.network==='discord') {
            return 'https://discordapp.com/u/'+(tipper.user_id ? tipper.user_id:tipper.to_id);
        } else if(tipper.network ==='reddit') {
            return 'https://reddit.com/u/'+tipper._id;
        } else {
            return 'https://twitter.com/'+tipper._id;
        }
    }
}
