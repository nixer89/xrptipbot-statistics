import { Component, OnInit } from "@angular/core";
import { UserStatisticsService } from '../services/userstatistics.service';

@Component({
    selector: "dashboardUser",
    templateUrl: "dashboardUser.html"
})
export class DashboardUserComponent implements OnInit {

    //All for User
    executionTimeoutAll;
    processingAll = false;

    //chart
    chartData: any;
    options:any;
    daysToReceive = 10;
    selectedDayOrWeek;
    daysOrWeeksDropDown;
    selectedUser: string;
    processingChart = false;
    executionTimeoutChart;

    //stats
    receivedTips:number = 0;
    sentTips:number = 0;
    deposits:number = 0;
    withdraws:number = 0;

    constructor(public userStatistics: UserStatisticsService) {
        let currentDate = new Date();

        this.daysOrWeeksDropDown = [
            {label:'Days', value:1},
            {label:'Weeks', value:7}
        ];

        this.selectedDayOrWeek = this.daysOrWeeksDropDown[0].value;

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

    async ngOnInit() {
        await this.refreshChart();
        this.userStatistics.getTopTipperReceived("nixerFFM");
      }

    async getReceivedTips(): Promise<any[]> {
        let receivedTips = await this.userStatistics.getReceivedTipsOfLastDaysForUser(this.daysToReceive*this.selectedDayOrWeek, this.selectedUser);
        let dataReceived = await this.userStatistics.aggregateNumbersForXRP(receivedTips, this.daysToReceive, this.selectedDayOrWeek);
        return [dataReceived[0].reverse(), dataReceived[1].reverse(), dataReceived[2].reverse()];
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
        await this.refreshStats();
        await this.refreshChart();
        this.processingAll = false;
    }

    async refreshStats() {
        let stats:number[] = await this.userStatistics.getUserStats(this.selectedUser);

        console.log("user stats result in dashboard: " + JSON.stringify(stats));
        this.receivedTips = stats && stats[0] ? stats[0] : 0;
        this.sentTips = stats && stats[1] ? stats[1] : 0;
        this.deposits = stats && stats[2] ? stats[2] : 0;
        this.withdraws = stats && stats[3] ? stats[3] : 0;
    }

    async refreshChart() {
        if(this.selectedUser && this.selectedUser.trim().length>0) {
            this.processingChart=true;
            console.log("selectedUser: " + this.selectedUser)
            //console.log("DropDownSelection: " + this.selectedDayOrWeek);
            let dataSet = await this.getReceivedTips();
            //console.log("dataSet received:" + JSON.stringify(dataSet));
            dataSet[0].push(100); //hidden value of 0 to always force the chart to start at 0 on y axis
            dataSet[1].push(100); //hidden value of 0 to always force the chart to start at 0 on y axis
            
            let labelsX = [];

            dataSet[2].forEach(jsonDate => {
                let from = new Date(jsonDate.from);
                let to = new Date(jsonDate.to);

                if(from.toLocaleDateString() === to.toLocaleDateString())
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
                    label: 'Received Tips',
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
}
