import { Component, Input } from "@angular/core";
import { ApiService } from '../services/api.service';
import { GeneralStatisticsService } from '../services/generalstatistics.service';
import { JsonpInterceptor } from '@angular/common/http';

@Component({
    selector: "userTable",
    templateUrl: "userTable.html"
})
export class UserTableComponent {

    //for initial view
    @Input()
    data:any;

    @Input()
    headline:string;

    @Input()
    columnName1:string;

    @Input()
    columnName2:string;

    @Input()
    columnField2:string;

    @Input()
    showAllButton:string;

    @Input()
    isReceivingTips?:string;

    @Input()
    isReceivingXRP?:string;

    @Input()
    isSentTips?:string;

    @Input()
    isSentXRP?:string;

    //sidebar overlay
    @Input()
    transactionTableFilter:string;

    @Input()
    foundUser?:string;

    @Input()
    isDetailsView?:string;

    overlayUsedTransactionFilter:string;
    openOverlayTable:string;
    openAllClicked:boolean = false;
    topTipperAllData:any[] = [];
    foundUserForward:string;
    hideLinks = false;

    constructor(private api: ApiService, private generalStats: GeneralStatisticsService) {}

    isDiscordOrCoilNetwork(tipper:any) {
        return 'discord'===tipper.network || 'coil' === tipper.network;
    }

    getXRPTipBotURL(tipper:any) : string {
        if(this.isDiscordOrCoilNetwork(tipper))
            return "https://www.xrptipbot.com/u:"+(tipper.user_id ? tipper.user_id : tipper.to_id)+"/n:"+tipper.network;
        else
            return "https://www.xrptipbot.com/u:"+tipper._id+"/n:"+tipper.network;
    }

    getStatisticsURL(tipper:any) : string {
        return "https://xrptipbot-statistics.siedentopf.xyz/userstatistics?user="+tipper._id+"&network="+tipper.network;
    }

    getNetworkURL(tipper:any): String {
        if(tipper.network==='discord') {
            return 'https://discordapp.com/u/'+(tipper.user_id ? tipper.user_id:tipper.to_id);
        } else if(tipper.network ==='reddit') {
            return 'https://reddit.com/u/'+tipper._id;
        } else if(tipper.network ==='coil') {
            return 'https://coil.com/u/'+tipper._id;
        } else {
            return 'https://twitter.com/'+tipper._id;
        }
    }

    resolveIconName(tipper:any): string {
        if('discord'===tipper.network)
            return 'albert';
        else if('reddit'===tipper.network)
            return 'berta'
        else if('coil'===tipper.network)
            return 'coil'
        else if('twitter'===tipper.network)
            return 'emil'
        else return 'emil';
    }

    openAllTransactions(tipper:any) {
        //console.log("userTable openTransactions()");
        //console.log("tipper: " + JSON.stringify(tipper));
        this.overlayUsedTransactionFilter = "type=tip"+this.transactionTableFilter.trim()+(this.isReceivingTips || this.isReceivingXRP ? "&user_id=": "&to_id=")+tipper['user_id'];
        //console.log("filter: " + this.overlayUsedTransactionFilter);
        this.openOverlayTable = "true";
    }

    async getAllTopTipperData(): Promise<any> {
        console.log("filter: " + this.transactionTableFilter);
        if(this.isReceivingTips) {
            this.topTipperAllData = await this.resolveNamesAndChangeNetwork(await this.api.getCountResult("/mostReceivedFrom","type=tip"+this.transactionTableFilter));
        } else if(this.isReceivingXRP) {
            this.topTipperAllData = await this.resolveNamesAndChangeNetwork(await this.api.getAggregatedResult("/xrp/mostReceivedFrom","type=tip"+this.transactionTableFilter));
        } else if(this.isSentTips) {
            this.topTipperAllData = await this.resolveNamesAndChangeNetwork(await this.api.getCountResult("/mostSentTo","type=tip"+this.transactionTableFilter));
        } else if(this.isSentXRP) {
            this.topTipperAllData = await this.resolveNamesAndChangeNetwork(await this.api.getAggregatedResult("/xrp/mostSentTo","type=tip"+this.transactionTableFilter));
        }

        //console.log("tipTipperAll loaded: " + this.topTipperAllData.length);
    }

    async openAllTopTipper() {
        //console.log("userTable openAll()");
        if(!this.openAllClicked) {
            this.openAllClicked = true;
            await this.getAllTopTipperData();
            this.openAllClicked = false;
        }
    }

    closedAll() {
        //console.log("userTable closedAll()");
        this.openAllClicked = false;
        this.overlayUsedTransactionFilter = "";
        this.openOverlayTable = null;
    }

    async resolveNamesAndChangeNetwork(numberResultList: any[]): Promise<any[]> {
        numberResultList = numberResultList.filter(user => user['_id']!="1069586402898337792");
        if(numberResultList.length > 10)
            numberResultList.pop();
        
        console.log("found user in user table: " + JSON.stringify(this.foundUser));
        let resolvedUserNames:any[] = await this.generalStats.resolveUserNameAndNetwork(numberResultList, this.foundUser['id'], this.foundUser['name']);
        return this.generalStats.changeToCorrectNetworkAndFixedXRP(resolvedUserNames, numberResultList);
    }
}