import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
    selector: "userTable",
    templateUrl: "userTable.html"
})
export class UserTableComponent {

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
    isReceiving?:string;

    //sidebar overlay
    @Input()
    transactionTableFilter:string;

    @Output()
    openAllClicked: EventEmitter<any> = new EventEmitter();

    @Output()
    allClosed: EventEmitter<any> = new EventEmitter();

    overlayUsedTransactionFilter:string;
    openOverlayTable:string;

    isDiscordNetwork(tipper:any) {
        return 'discord'===tipper.network;
    }

    getXRPTipBotURL(tipper:any) : string {
        if(this.isDiscordNetwork(tipper))
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
        } else {
            return 'https://twitter.com/'+tipper._id;
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

    openTransactions(tipper:any) {
        console.log("tipper: " + JSON.stringify(tipper));
        this.overlayUsedTransactionFilter = "type=tip"+this.transactionTableFilter.trim()+(this.isReceiving ? "&user_id=": "&to_id=")+tipper['user_id'];
        console.log("filter: " + this.overlayUsedTransactionFilter);
        this.openOverlayTable = "true";
    }

    openAll() {
        this.openAllClicked.emit(null);
    }

    closedAll() {
        this.overlayUsedTransactionFilter = "";
        this.openOverlayTable = null;
        this.allClosed.emit(null);
    }
}