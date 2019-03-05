import { Component, OnInit } from "@angular/core";
import { UserStatisticsService } from '../services/userstatistics.service';
import { ApiService } from '../services/api.service';

@Component({
    selector: "dashboardUser",
    templateUrl: "dashboardUser.html"
})
export class DashboardUserComponent implements OnInit {

    //All for User
    executionTimeoutAll;
    processingAll = false;
    user_id:string;

    //chart
    chartData: any;
    options:any;
    daysToReceive = 10;
    selectedDayOrWeek;
    daysOrWeeksDropDown;
    selectedUser: string;
    processingChart = false;
    executionTimeoutChart;
    includeDeposits: boolean = false;

    //stats
    userStats:any[]=[
        {label: "Received Tips", count: 0, xrp:0},
        {label: "Sent Tips", count: 0, xrp:0},
        {label: "Deposits", count: 0, xrp:0},
        {label: "Withdrawals", count: 0, xrp:0},
    ];
    topReceivedTips:any[] = [];
    topSentTips:any[] = [];
    topReceivedXRP:any[] = [];
    topSentXRP:any[] = [];

    constructor(public userStatistics: UserStatisticsService, public api: ApiService) {

        this.daysOrWeeksDropDown = [
            {label:'Days', value:1},
            {label:'Weeks', value:7}
        ];

        this.selectedDayOrWeek = this.daysOrWeeksDropDown[0].value;
        this.initWithZeroValues();        
    }

    async ngOnInit() {
        await this.refreshChart();
        //this.userStatistics.getTopTipperReceived("nixerFFM");
      }

    async getSentAndReceivedTips(): Promise<any[]> {
        let promises:any[] = [];
        promises.push(this.userStatistics.getReceivedTipsOfLastDaysForUser(this.daysToReceive*this.selectedDayOrWeek, this.user_id, this.includeDeposits));
        promises.push(this.userStatistics.getSentTipsOfLastDaysForUser(this.daysToReceive*this.selectedDayOrWeek, this.user_id));
        let restult = await Promise.all(promises);
        
        let dataReceived = this.userStatistics.aggregateNumbersForXRP(restult[0], this.daysToReceive, this.selectedDayOrWeek);
        let dataSent = this.userStatistics.aggregateNumbersForXRP(restult[1], this.daysToReceive, this.selectedDayOrWeek);

        return [dataReceived[0].reverse(), dataSent[0].reverse(), dataReceived[1].reverse()];
    }

    refreshAllWithTimeout() {
        if(Number.isInteger(this.daysToReceive)) {
            if(this.executionTimeoutAll) clearTimeout(this.executionTimeoutAll);
            
            this.executionTimeoutAll = setTimeout(()=> this.refreshAll(),500);
        }
    }

    refreshChartWithTimeout() {
        if(Number.isInteger(this.daysToReceive)) {
            if(this.executionTimeoutChart) clearTimeout(this.executionTimeoutChart);
            
            this.executionTimeoutChart = setTimeout(()=> this.refreshChart(),300);
        }
    }

    async refreshAll() {
        this.processingAll = true;
        this.user_id = await this.api.getUserId(this.selectedUser.trim());
        console.log("selectedUser: " + this.selectedUser)
        console.log("userId for user " + this.selectedUser + " is: " + this.user_id);
        //check if user was found
        if(this.user_id && this.user_id.trim().length>0) {
            //user found, continue!
            let promises:any[] = [this.refreshStats(), this.refreshChart()]
            await Promise.all(promises);    
        } else {
            this.initWithZeroValues();
        }
        
        this.processingAll = false;
    }

    async refreshStats() {
        let stats:number[] = await this.userStatistics.getUserStats(this.user_id);
        let topTipper:any = await this.userStatistics.getTopTipper(this.user_id);

        //console.log("user stats result in dashboard: " + JSON.stringify(stats));
        if(stats) {
            this.userStats[0].count = stats[0] ? stats[0] : 0;
            this.userStats[0].xrp = stats[1] ? stats[1].toFixed(6) : 0;
            this.userStats[1].count = stats[2] ? stats[2] : 0;
            this.userStats[1].xrp = stats[3] ? stats[3].toFixed(6) : 0;
            this.userStats[2].count = stats[4] ? stats[4] : 0;
            this.userStats[2].xrp = stats[5] ? stats[5].toFixed(6) : 0;
            this.userStats[3].count = stats[6] ? stats[6] : 0;
            this.userStats[3].xrp = stats[7] ? stats[7].toFixed(6) : 0;
        }

        //console.log("top tipper result in dashboard: " + JSON.stringify(topTipper));
        if(topTipper) {
            this.topReceivedTips = topTipper[0] ? topTipper[0]: [];
            this.topSentTips = topTipper[1] ? topTipper[1]: [];
            this.topReceivedXRP = topTipper[2] ? topTipper[2]: [];
            this.topSentXRP = topTipper[3] ? topTipper[3]: [];
        }
    }

    async refreshChart() {
        if(this.selectedUser && this.selectedUser.trim().length>0) {
            this.processingChart=true;
            //console.log("include deposits? " + this.includeDeposits);
            //console.log("DropDownSelection: " + this.selectedDayOrWeek);
            let dataSet = await this.getSentAndReceivedTips();
            //console.log("dataSet received:" + JSON.stringify(dataSet));
            dataSet[0].push(0); //hidden value of 0 to always force the chart to start at 0 on y axis
            dataSet[1].push(0); //hidden value of 0 to always force the chart to start at 0 on y axis
            
            let labelsX = [];

            dataSet[2].forEach(jsonDate => {
                let from = new Date(jsonDate.from);
                let to = new Date(jsonDate.to);

                if(this.selectedDayOrWeek==1)
                    labelsX.push(to.toLocaleDateString());
                else
                    labelsX.push(from.toLocaleDateString() + " - \n" + to.toLocaleDateString());
            })
        
            this.chartData = {
            labels: labelsX,
            datasets: [
                {
                    label: 'Received XRP',
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
                    text: 'Statistics of ' + this.selectedUser + ' for last ' + (dataSet[2].length) + (this.selectedDayOrWeek===1 ? ' Days' : ' Weeks'),
                    fontSize: 16
                },
                legend: {
                    position: 'top'
                }
            };
            this.processingChart=false;
        }
    }

    initWithZeroValues() {
        let currentDate = new Date();

        this.userStats = [
            {label: "Received Tips", count: 0, xrp:0},
            {label: "Sent Tips", count: 0, xrp:0},
            {label: "Deposits", count: 0, xrp:0},
            {label: "Withdrawals", count: 0, xrp:0},
        ];

        this.topReceivedTips = [];
        this.topSentTips = [];
        this.topReceivedXRP = [];
        this.topSentXRP = [];

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
}
