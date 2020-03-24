import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from '@angular/router';
import { UserStatisticsService } from '../services/userstatistics.service';
import { GeneralStatisticsService } from '../services/generalstatistics.service';
import { ApiService } from '../services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpParams } from '@angular/common/http';
import { ClipboardService } from 'ngx-clipboard'
import { LocalStorageService } from 'angular-2-local-storage';
import * as formatUtil from '../util/formattingUtil';
import{ GoogleAnalyticsService } from '../services/google-analytics.service';

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
    excludeBots:boolean = false;
    excludeCharities:boolean = false;
    overlayUsedTransactionFilter:string;
    openOverlayTable:string;

    //detailed transactions
    userFilter:string;
    toFilter:string;

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
    userBalance:string;
    tipbotAccountInfo:string;
    userStats:any[]=[
        {label: "Received Tips", count: 0, xrp: 0, showTrx: true, isReceiving: true},
        {label: "Sent Tips", count: 0, xrp: 0, showTrx: true, isReceiving: false},
        {label: "Deposits", count: 0, xrp: 0, showTrx: true, isDeposit: true},
        {label: "Withdrawals", count: 0, xrp: 0, showTrx: true, isWithdrawal: true},
        {label: "ILP-Deposits", count: '-', xrp: 0, showTrx: false, showInfoBox: true},
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
                private route: ActivatedRoute,
                private snackBar: MatSnackBar,
                private clipboard: ClipboardService,
                private localStorage: LocalStorageService,
                private googleAnalytics: GoogleAnalyticsService) {

        this.daysOrWeeksDropDown = [
            {label:'Days', value:1},
            {label:'Weeks', value:7},
            {label:'Months', value:31},
            {label:'Years', value: 366}
        ];

        this.networkDropdown = [
            {label:'emil', value:'twitter'},
            {label:'berta', value:'reddit'},
            {label:'albert', value:'discord'},
            {label: this.localStorage.get("darkMode") ? 'coil_reversed' : 'coil', value: 'coil'},
            {label: this.localStorage.get("darkMode") ? 'paper_reversed' : 'paper', value: 'internal'}
        ];

        this.selectedDayOrWeek = this.daysOrWeeksDropDown[0].value;
        this.selectedNetwork = this.networkDropdown[0].value;
    }

    async ngOnInit() {

        this.excludeBots = this.localStorage.get("excludeBots");
        this.excludeCharities = this.localStorage.get("excludeCharities");

        this.route.queryParams.subscribe(params => {
            let userParam = params.user;
            let networkParam = params.network;
            let fromDateParam = params.from_date;
            let toDateParam = params.to_date;
            let excludeBotsParam = params.excludeBots;
            let excludeCharitiesParam = params.excludeCharities;
            //console.log("param map: " + JSON.stringify(this.route.snapshot.queryParamMap));
            if((userParam && userParam.trim().length>0) || fromDateParam || fromDateParam) {
                this.selectedUser = null;
                this.foundUser = null;
                this.initWithZeroValues();

                if(userParam)
                    this.selectedUser = userParam.trim();

                if(networkParam && networkParam.trim().length>0)
                    this.selectedNetwork = networkParam.trim();

                if(fromDateParam && fromDateParam.trim().length>0 && Date.parse(fromDateParam)>0)
                    this.fromDate = new Date(fromDateParam);
                else if(!this.useDateRange)
                    this.fromDate = null;

                if(toDateParam && toDateParam.trim().length>0 && Date.parse(toDateParam)>0)
                    this.toDate = new Date(toDateParam);
                else if(!this.useDateRange)
                    this.toDate = null;
                
                if(this.fromDate && this.toDate)
                    this.useDateRange = true;
                
                this.excludeBots = (excludeBotsParam == 'true');
                this.excludeCharities = (excludeCharitiesParam == 'true');

                if(this.selectedUser) {
                    this.refreshAll();
                    this.googleAnalytics.analyticsEventEmitter("direct_link", "user", this.selectedUser.trim().toLowerCase()+'|'+this.selectedNetwork.trim().toLowerCase());
                }
                    
            } else {
                this.initWithZeroValues();        
            }
        });
    }

    refreshAllWithTimeout() {
        if(Number.isInteger(this.daysToReceive)) {
            if(this.executionTimeoutAll) clearTimeout(this.executionTimeoutAll);
            
            this.executionTimeoutAll = setTimeout(()=> this.refreshAll(),1500);
        }
    }

    refreshStatsWithTimeout() {
        if(this.executionTimeoutStats) clearTimeout(this.executionTimeoutStats);
        
        this.executionTimeoutStats = setTimeout(()=> this.refreshStats(),2500);
    }

    refreshChartWithTimeout() {
        if(Number.isInteger(this.daysToReceive)) {
            if(this.executionTimeoutChart) clearTimeout(this.executionTimeoutChart);
            
            this.executionTimeoutChart = setTimeout(()=> {
                this.refreshChart();
                this.googleAnalytics.analyticsEventEmitter("refresh_chart_only", "user", this.foundUser.name.toLowerCase()+'|'+this.foundUser.network);
            },1000);
        }
    }

    async refreshAll() {
        this.initWithZeroValues();
        if(this.selectedUser) {
            this.selectedUser = this.selectedUser.trim()
            console.time("refreshUser");
            this.processingAll = true;
            this.foundUser = await this.api.getUser(this.selectedUser, this.selectedNetwork);
            if(this.foundUser) {
                this.selectedUser = this.foundUser.name;
                console.log("selectedUser: " + this.selectedUser)
                console.log("found user: " + JSON.stringify(this.foundUser));
                this.user_id = this.foundUser.id;
                //check if user was found
                //user found, continue!
                let promises:any[] = [this.refreshStats(), this.refreshChart()]
                await Promise.all(promises); 

            }
            
            this.processingAll = false;
            console.timeEnd("refreshUser");
        }
    }

    async refreshStats() {
        this.initStatsWithZeroValues();
        if(this.selectedUser && this.selectedUser.trim().length>0 &&
            (!this.useDateRange || (this.useDateRange && this.fromDate && this.toDate && this.fromDate <= this.toDate))) {
                this.processingStats = true;
                this.googleAnalytics.analyticsEventEmitter("search_user", "user", this.foundUser.name.toLowerCase()+'|'+this.foundUser.network);
                console.time("callUserStatsApi")
                let promises:any[] = []
                promises.push(await this.userStatistics.getUserStats(this.useDateRange ? this.fromDate:null, this.useDateRange ? this.toDate:null, this.selectedNetwork, this.excludeBots, this.excludeCharities, false, this.selectedUser.trim(), this.foundUser ? this.foundUser.id : null));
                promises.push(await this.generalStats.getTopTipper(this.useDateRange ? this.fromDate:null, this.useDateRange ? this.toDate:null, 10, this.selectedNetwork, this.excludeBots, this.excludeCharities, false, this.selectedUser.trim()));
                let promResult = await Promise.all(promises);
                let stats:any[] = promResult[0];
                let topTipper:any = promResult[1];
                console.timeEnd("callUserStatsApi")

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
                    this.userBalance = stats[9];
                    this.tipbotAccountInfo = stats[10] || 'no account yet';
                }

                //console.log("top tipper result in dashboard: " + JSON.stringify(topTipper));
                if(topTipper) {
                    this.topReceivedTips = topTipper[0] ? topTipper[0]: [];
                    this.topSentTips = topTipper[1] ? topTipper[1]: [];
                    this.topReceivedXRP = topTipper[2] ? topTipper[2]: [];
                    this.topSentXRP = topTipper[3] ? topTipper[3]: [];
                    this.userFilter = topTipper[4];
                    this.toFilter = topTipper[5];
                }

                //console.log(JSON.stringify(this.topSentTips));

                this.processingStats = false;
        }
    }

    async refreshChart() {
        if(this.selectedUser && this.selectedUser.trim().length>0) {
            this.processingChart=true;
            //console.log("include deposits? " + this.includeDeposits);
            //console.log("DropDownSelection: " + this.selectedDayOrWeek);
            console.time("callUserChartsApi")
            let result:any = await this.generalStats.getChartData(this.daysToReceive, this.selectedDayOrWeek, false, true, false, true, false, this.includeDeposits, this.selectedUser.trim(), this.selectedNetwork.trim());
            console.timeEnd("callUserChartsApi")
            
            
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
                    labelsX.push(to.getDate()+"."+(to.getMonth()+1)+"."+to.getFullYear());
                else
                    labelsX.push(from.getDate()+"."+(from.getMonth()+1)+"."+from.getFullYear() + " - \n" + to.getDate()+"."+(to.getMonth()+1)+"."+to.getFullYear());
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
                    text: 'Statistics of ' + this.selectedUser + ' for last ' + (dataSet[2].length) +' '+ this.getChartTextSelection(),
                    fontSize: 16
                },
                legend: {
                    position: 'top'
                }
            };
            this.processingChart=false;
        }
    }

    getChartTextSelection(): string {
        if(this.selectedDayOrWeek==1) return "Days";
        else if(this.selectedDayOrWeek==7) return "Weeks";
        else if(this.selectedDayOrWeek==31) return "Months";
        else if(this.selectedDayOrWeek==366) return "Years";
    }

    initStatsWithZeroValues() {
        if(this.foundUser != null && (!this.selectedUser || this.selectedUser.trim().length <= 0 || this.selectedUser.toLocaleLowerCase() != this.foundUser.name.toLocaleLowerCase()))
            this.foundUser = null;
        
        this.userBalance = null;
        this.tipbotAccountInfo = null;
        this.userStats = [
            {label: "Received Tips", count: 0, xrp: 0, showTrx: true, isReceiving: true},
            {label: "Sent Tips", count: 0, xrp: 0, showTrx: true, isReceiving: false},
            {label: "Deposits", count: 0, xrp: 0, showTrx: true, isDeposit: true},
            {label: "Withdrawals", count: 0, xrp: 0, showTrx: true, isWithdrawal: true},
            {label: "ILP-Deposits", count: '-', xrp: 0, showTrx: false, showInfoBox: true},
        ];

        this.topReceivedTips = [];
        this.topSentTips = [];
        this.topReceivedXRP = [];
        this.topSentXRP = [];
    }

    initWithZeroValues() {
        //console.log("initStatsWithZeroValues()");

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

    isDiscordOrCoilNetwork(tipper:any) {
        return 'discord'===tipper.network || 'coil'===tipper.network ||'internal'===tipper.network;
    }

    getXRPTipBotURL(tipper:any) : string {
        return "https://www.xrptipbot.com/u:"+(tipper.network==='discord' ? tipper.id : tipper.name)+"/n:"+tipper.network;
    }

    getNetworkURL(tipper:any): String {
        if(tipper.network==='discord') {
            return 'https://discordapp.com/u/'+tipper.name;
        } else if(tipper.network ==='reddit') {
            return 'https://reddit.com/u/'+tipper.name;
        } else if(tipper.network === 'coil') {
            return 'https://coil.com/u/'+tipper.name;
        } else {
            return 'https://twitter.com/'+tipper.name;
        }
    }

    resolveIconName(tipper:any): string {
        if('discord'===tipper.network)
            return 'albert';
        else if('reddit'===tipper.network)
            return 'berta';
        else if('coil'===tipper.network) {
            if(this.localStorage.get("darkMode") != false)
                return 'coil_reversed'
            else
                return 'coil'
        }
        else if('twitter'===tipper.network)
            return 'emil';
        else if('internal' === tipper.network) {
            if(this.localStorage.get("darkMode") != false)
                return 'paper_reversed';
            else
                return 'paper'
        }
            
        else return 'emil';
    }

    openAllTransactionsClick(userStats: any) {
        let filter = "";
        if(userStats.isDeposit) {
            filter = "type=deposit";
            this.googleAnalytics.analyticsEventEmitter("show_deposits", "user", this.foundUser.name.toLowerCase()+'|'+this.foundUser.network);
        }
        else if(userStats.isWithdrawal) {
            filter = "type=withdraw"
            this.googleAnalytics.analyticsEventEmitter("show_withdrawals", "user", this.foundUser.name.toLowerCase()+'|'+this.foundUser.network);
        }
        else {
            filter = "type=tip";
            if(userStats.isReceiving)
                this.googleAnalytics.analyticsEventEmitter("show_received", "user", this.foundUser.name.toLowerCase()+'|'+this.foundUser.network);
            else
                this.googleAnalytics.analyticsEventEmitter("show_sent", "user", this.foundUser.name.toLowerCase()+'|'+this.foundUser.network);
        }
        
        if(userStats.isReceiving)
            filter+= "&to="+this.foundUser.name+"&to_network="+this.foundUser.network;
        else
            filter+= "&user="+this.foundUser.name+"&user_network="+this.foundUser.network;
        
        this.openAllTransactions(filter);
    }

    openAllTransactions(filter:string) {
        let optionalDateFilter = "";
        if(this.useDateRange && this.fromDate && this.toDate) {
            optionalDateFilter+="&from_date="+formatUtil.dateToStringEuropeForAPI(this.generalStats.setZeroMilliseconds(this.fromDate));
            optionalDateFilter+="&to_date="+formatUtil.dateToStringEuropeForAPI(this.generalStats.setHighMilliseconds(this.toDate));
        }
        //console.log("userTable openTransactions()");
        //console.log("tipper: " + JSON.stringify(tipper));
        this.overlayUsedTransactionFilter = filter + optionalDateFilter;
        //console.log("filter: " + this.overlayUsedTransactionFilter);
        this.openOverlayTable = "true";
    }

    closedAll() {
        this.overlayUsedTransactionFilter = "";
        this.openOverlayTable = null;
    }

    copy2Clipboard() {
        let params = new HttpParams()
        
        let url = window.location.origin+'/userstatistics?'

        if(this.selectedUser)
            params = params.set('user',this.selectedUser);
        
        if(this.selectedNetwork)
            params = params.set('network',this.selectedNetwork);
        
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

        if(this.clipboard.isSupported) {
            this.clipboard.copyFromContent(url+params.toString());
            this.snackBar.open("The link to this statistics page has been copied to your clipboard.", null, {duration: 3000});
        }

        this.googleAnalytics.analyticsEventEmitter("copy_link", "user", this.foundUser.name.toLowerCase()+'|'+this.foundUser.network);
    }

    dateToLocaleStringEuropeTime(date: Date): string {
        return formatUtil.dateToStringEuropeForLocale(date) + " GMT+1";
    }

    handleBarChartClick(event:any) {
        
        //console.log(event.element);
        //console.log(event.element._datasetIndex);
        //console.log(event.element._index);
        //console.log("chart labels: " +this.chartData.labels[event.element._index]);

        let clickedBarLabel:string = this.chartData.labels[event.element._index];

        let chartLabels:string[] = clickedBarLabel.split('-');

        let startDateValues:string[] = chartLabels[0].trim().split('.');
        let endDateValues:string[] = (chartLabels.length>1 ? chartLabels[1] : chartLabels[0]).trim().split('.');

        let fromDateChart:Date = new Date(startDateValues[2]+'-'+startDateValues[1]+'-'+startDateValues[0]);        
        let toDateChart:Date = new Date(endDateValues[2]+'-'+endDateValues[1]+'-'+endDateValues[0]);

        //console.log("fromDateChart: " + fromDateChart);
        //console.log("toDateChart: " + toDateChart);

        fromDateChart = this.generalStats.setZeroTime(fromDateChart)
        toDateChart = this.generalStats.setHigherTime(toDateChart);

        let userFilter:string = event.element._datasetIndex == 0 ? "to="+this.selectedUser+"&to_network="+this.selectedNetwork : "user="+this.selectedUser+"&user_network="+this.selectedNetwork;

        this.overlayUsedTransactionFilter = "type=tip&"+userFilter+this.generalStats.constructOptionalFilter(fromDateChart, toDateChart);

        //console.log("overlayUsedTransactionFilter: " + this.overlayUsedTransactionFilter)

        this.openOverlayTable = "true";
    }
}
