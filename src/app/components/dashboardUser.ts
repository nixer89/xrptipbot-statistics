import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from '@angular/router';
import { UserStatisticsService } from '../services/userstatistics.service';
import { GeneralStatisticsService } from '../services/generalstatistics.service';
import { ApiService } from '../services/api.service';

@Component({
    selector: "dashboardUser",
    templateUrl: "dashboardUser.html"
})
export class DashboardUserComponent implements OnInit {

    //All for User
    executionTimeoutAll;
    processingAll = false;
    selectedUser: string;
    foundUser: any;
    user_id:string;
    networkDropdown:any;
    selectedNetwork:string;

    //chart
    chartData: any;
    options:any;
    daysToReceive = 10;
    selectedDayOrWeek;
    daysOrWeeksDropDown;
    processingChart = false;
    executionTimeoutChart;
    includeDeposits: boolean = false;

    //stats
    executionTimeoutStats;
    processingStats = false;
    userStats:any[]=[
        {label: "Received Tips", count: 0, xrp:0},
        {label: "Sent Tips", count: 0, xrp:0},
        {label: "Deposits", count: 0, xrp:0},
        {label: "Withdrawals", count: 0, xrp:0},
        {label: "ILP-Deposits", count: '-', xrp:0},
    ];
    useDateRange:boolean = false;
    fromDate:Date;
    toDate:Date;

    topReceivedTips:any[] = [];
    topSentTips:any[] = [];
    topReceivedXRP:any[] = [];
    topSentXRP:any[] = [];

    constructor(private userStatistics: UserStatisticsService,
                private api: ApiService,
                private generalStats: GeneralStatisticsService,
                private route: ActivatedRoute) {

        this.daysOrWeeksDropDown = [
            {label:'Days', value:1},
            {label:'Weeks', value:7}
        ];

        this.networkDropdown = [
            {label:'emil', value:'twitter'},
            {label:'berta', value:'reddit'},
            {label:'albert', value:'discord'},
        ];

        this.selectedDayOrWeek = this.daysOrWeeksDropDown[0].value;
        this.selectedNetwork = this.networkDropdown[0].value;
    }

    async ngOnInit() {
        let userInQuery = this.route.snapshot.queryParamMap.get('user');
        let networkInQuery = this.route.snapshot.queryParamMap.get('network');
        //console.log("param map: " + JSON.stringify(this.route.snapshot.queryParamMap));
        if(userInQuery && userInQuery.trim().length>0) {
            this.selectedUser = userInQuery.trim();

            if(networkInQuery && networkInQuery.trim().length>0)
                this.selectedNetwork = networkInQuery.trim();
            
            this.refreshAll();
        } else {
            this.initWithZeroValues();        
        }
    }

    refreshAllWithTimeout() {
        this.initStatsWithZeroValues();
        if(Number.isInteger(this.daysToReceive)) {
            if(this.executionTimeoutAll) clearTimeout(this.executionTimeoutAll);
            
            this.executionTimeoutAll = setTimeout(()=> this.refreshAll(),1500);
        }
    }

    refreshStatsWithTimeout() {
        this.initStatsWithZeroValues();
        if(this.executionTimeoutStats) clearTimeout(this.executionTimeoutStats);
        
        this.executionTimeoutStats = setTimeout(()=> this.refreshStats(),1500);
    }

    refreshChartWithTimeout() {
        if(Number.isInteger(this.daysToReceive)) {
            if(this.executionTimeoutChart) clearTimeout(this.executionTimeoutChart);
            
            this.executionTimeoutChart = setTimeout(()=> this.refreshChart(),300);
        }
    }

    async refreshAll() {
        if(this.selectedUser) {
            this.processingAll = true;
            this.foundUser = await this.api.getUser(this.selectedUser.trim(), this.selectedNetwork);
            if(this.foundUser) {
                console.log("selectedUser: " + this.selectedUser)
                console.log("found user: " + JSON.stringify(this.foundUser));
                this.user_id = this.foundUser.id;
                //check if user was found
                //user found, continue!
                let promises:any[] = [this.refreshStats(), this.refreshChart()]
                await Promise.all(promises); 

            } else {
                this.initStatsWithZeroValues();
            }
            
            this.processingAll = false;
        }
    }

    async refreshStats() {
        if(this.selectedUser && this.selectedUser.trim().length>0 &&
            (!this.useDateRange || (this.useDateRange && this.fromDate && this.toDate && this.fromDate <= this.toDate))) {
                this.processingStats = true;
                let stats:number[] = await this.userStatistics.getUserStats(this.useDateRange ? this.fromDate:null, this.useDateRange ? this.toDate:null, this.selectedNetwork, this.user_id, this.selectedUser.trim());
                let topTipper:any = await this.generalStats.getTopTipper(this.useDateRange ? this.fromDate:null, this.useDateRange ? this.toDate:null, this.selectedNetwork, this.user_id, this.selectedUser.trim());

                //console.log("tipTipper: " + JSON.stringify(topTipper));

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
                    this.userStats[4].xrp = stats[8] ? stats[8].toFixed(6) : 0;
                }

                //console.log("top tipper result in dashboard: " + JSON.stringify(topTipper));
                if(topTipper) {
                    this.topReceivedTips = topTipper[0] ? topTipper[0]: [];
                    this.topSentTips = topTipper[1] ? topTipper[1]: [];
                    this.topReceivedXRP = topTipper[2] ? topTipper[2]: [];
                    this.topSentXRP = topTipper[3] ? topTipper[3]: [];
                }

                this.processingStats = false;
        } else {
            this.initStatsWithZeroValues();
        }
    }

    async refreshChart() {
        if(this.selectedUser && this.selectedUser.trim().length>0) {
            this.processingChart=true;
            //console.log("include deposits? " + this.includeDeposits);
            //console.log("DropDownSelection: " + this.selectedDayOrWeek);
            let result:any = await this.generalStats.getChartData(this.daysToReceive, this.selectedDayOrWeek, false, true, false, true, false, this.includeDeposits, this.user_id, this.selectedUser ? this.selectedUser.trim():null);
            
            
            if(this.includeDeposits) {
                for(let i = 0;i<result.receivedXRP.length;i++)
                    result.receivedXRP[i] = (result.receivedXRP[i]*1000000+result.directDepositsXRP[i]*1000000)/1000000;
            }

            let dataSet:any[]=[];
            dataSet.push(result.receivedXRP.reverse());
            dataSet.push(result.sentXRP.reverse());
            dataSet.push(result.dateTimes.reverse())

            
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

    initStatsWithZeroValues() {
        this.foundUser = null;
        this.userStats = [
            {label: "Received Tips", count: 0, xrp:0},
            {label: "Sent Tips", count: 0, xrp:0},
            {label: "Deposits", count: 0, xrp:0},
            {label: "Withdrawals", count: 0, xrp:0},
            {label: "ILP-Deposits", count: '-', xrp:0},
        ];

        this.topReceivedTips = [];
        this.topSentTips = [];
        this.topReceivedXRP = [];
        this.topSentXRP = [];
    }

    initWithZeroValues() {

        this.initStatsWithZeroValues();
        let currentDate = new Date();

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

    isDiscordNetwork(tipper:any) {
        return 'discord'===tipper.network;
    }

    getXRPTipBotURL(tipper:any) : string {
        return "https://www.xrptipbot.com/u:"+(tipper.network==='discord' ? tipper.id : tipper.name)+"/n:"+tipper.network;
    }

    getStatisticsURL(tipper:any) : string {
        return "https://xrptipbot-statistics.siedentopf.xyz/userstatistics?user="+tipper.name+"&network="+tipper.network;
    }

    getNetworkURL(tipper:any): String {
        if(tipper.network==='discord') {
            return 'https://discordapp.com/u/'+tipper.name;
        } else if(tipper.network ==='reddit') {
            return 'https://reddit.com/u/'+tipper.name;
        } else {
            return 'https://twitter.com/'+tipper.name;
        }
    }

    resolveIconName(tipper:any): string {
        if('discord'===tipper.network)
            return 'albert';
        else if('reddit'===tipper.network)
            return 'berta'
        else if('twitter'===tipper.network)
            return 'emil'
        else return 'emil';
    }
}
