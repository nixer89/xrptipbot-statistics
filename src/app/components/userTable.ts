import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { GeneralStatisticsService } from '../services/generalstatistics.service';

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

    @Input()
    isILP?:string;

    //sidebar overlay
    @Input()
    transactionTableFilter:string;

    @Input()
    foundUser?:string;

    @Input()
    isDetailsView?:string;

    @Output()
    closeIt: EventEmitter<any> = new EventEmitter();

    overlayUsedTransactionFilter:string;
    openOverlayTable:string;
    openAllClicked:boolean = false;
    topTipperAllData:any[] = [];
    foundUserForward:string;
    hideLinks = false;

    constructor(private router: Router, private api: ApiService, private generalStats: GeneralStatisticsService) {}

    isDiscordOrCoilNetwork(tipper:any) {
        return 'discord'===tipper.network || 'coil' === tipper.network || 'internal'===tipper.network;
    }

    getXRPTipBotURL(tipper:any) : string {
        if(this.isDiscordOrCoilNetwork(tipper))
            return "https://www.xrptipbot.com/u:"+tipper.id+"/n:"+tipper.network;
        else
            return "https://www.xrptipbot.com/u:"+tipper.userName+"/n:"+tipper.network;
    }

    getNetworkURL(tipper:any): String {
        if(tipper.network==='discord') {
            return 'https://discordapp.com/u/'+tipper.id;
        } else if(tipper.network ==='reddit') {
            return 'https://reddit.com/u/'+tipper.userName;
        } else if(tipper.network ==='coil') {
            return 'https://coil.com/u/'+tipper.userName;
        } else {
            return 'https://twitter.com/'+tipper.userName;
        }
    }

    resolveIconName(tipper:any): string {
        if('discord'===tipper.network)
            return 'albert';
        else if('reddit'===tipper.network)
            return 'berta';
        else if('coil'===tipper.network)
            return 'coil';
        else if('twitter'===tipper.network)
            return 'emil';
        else if('internal'===tipper.network)
            return 'paper';
        else return 'emil';
    }

    openAllTransactions(tipper:any) {
        //console.log("userTable openAllTransactions")
        //console.log("userTable openTransactions()");
        //console.log("tipper: " + JSON.stringify(tipper));
        this.overlayUsedTransactionFilter = "type=tip"
        this.overlayUsedTransactionFilter+= this.transactionTableFilter ? this.transactionTableFilter.trim():"";
        this.overlayUsedTransactionFilter+=(this.isReceivingTips || this.isReceivingXRP ? "&user=": "&to=")+tipper['userName'];
        //console.log("filter: " + this.overlayUsedTransactionFilter);
        this.openOverlayTable = "true";
    }

    async getAllTopTipperData(): Promise<any> {
        //console.log("filter: " + this.transactionTableFilter);
        if(this.isReceivingTips) {
            this.topTipperAllData = await this.resolveNamesAndChangeNetwork(await this.api.getCountResult("/mostReceivedFrom","type=tip"+this.transactionTableFilter));
        } else if(this.isReceivingXRP) {
            this.topTipperAllData = await this.resolveNamesAndChangeNetwork(await this.api.getAggregatedResult("/xrp/mostReceivedFrom","type=tip"+this.transactionTableFilter));
        } else if(this.isSentTips) {
            this.topTipperAllData = await this.resolveNamesAndChangeNetwork(await this.api.getCountResult("/mostSentTo","type=tip"+this.transactionTableFilter));
        } else if(this.isSentXRP) {
            this.topTipperAllData = await this.resolveNamesAndChangeNetwork(await this.api.getAggregatedResult("/xrp/mostSentTo","type=tip"+this.transactionTableFilter));
        } else if(this.isILP) {
            this.topTipperAllData = await this.resolveNamesAndChangeNetwork(await this.api.getAggregatedILPResult("/xrp/mostReceived",this.transactionTableFilter));

            //convert drops to XRP
            if(this.topTipperAllData)
                this.topTipperAllData.forEach(user => user.amount = user.amount/1000000);
        }

        //console.log("tipTipperAll loaded: " + this.topTipperAllData.length);
    }

    async openAllTopTipper() {
        //console.log("userTable openAllTopTipper")
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
        //console.log("found user in user table: " + JSON.stringify(this.foundUser));
        return this.generalStats.changeToCorrectNetworkAndFixedXRP(numberResultList);
    }

    getUserName(tipper): string {
        if('COIL_SETTLED_ILP_BALANCE' === tipper.userName || 'COIL_SETTLEMENT_ACCOUNT' === tipper.userName)
            return tipper.userName.substring(0,tipper.userName.lastIndexOf('_')+1) + ' ' + tipper.userName.substring(tipper.userName.lastIndexOf('_')+1)
        else if(tipper.network && ( tipper.network === 'coil' || tipper.network === 'internal')) {
            if(this.isILP)
                return tipper.userName.substring(0,21)+'...';
            else
                return tipper.userName.substring(0,10)+'...';
        }
            
        else
            return tipper.userName;
    }

    closeFullList() {
        //console.log("userTable closeFullList()");
        if(this.isDetailsView) {
            //console.log("userTable closeFullList() reset");
            this.topTipperAllData = null;
            this.openAllClicked = false;
            this.closeIt.emit(null);
        }
    }
}