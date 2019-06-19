import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { ApiService } from '../services/api.service';

@Component({
    selector: "transactionTable",
    templateUrl: "transactionTable.html"
})
export class TransactionTableComponent implements OnInit {

    @Input()
    transactionFilter:string;

    @Output()
    closed: EventEmitter<any> = new EventEmitter();

    data:any[];

    constructor(private api: ApiService) {

    }

    async ngOnInit() {
        //console.log("transactionTable ngOnInit()");
        //console.log("getting transactions");
        this.data = await this.api.callTipBotStandarizedFeedApi(this.transactionFilter.trim());
        //console.log("got data: " + this.data.length);
    }

    cleanup() {
        //console.log("transactionTable cleanup()");
        this.transactionFilter = null;
        this.data = null;
        this.closed.emit(null);
    }

    isDiscordNetwork(tipper:any) {
        return 'discord'===tipper.network;
    }

    getXRPTipBotURL(tipper:any) : string {
        if(this.isDiscordNetwork(tipper))
            return "https://www.xrptipbot.com/u:"+tipper.id+"/n:"+tipper.network;
        else
            return "https://www.xrptipbot.com/u:"+tipper.userName+"/n:"+tipper.network;
    }

    getStatisticsURLFrom(data:any) : string {
        return window.location.origin+"/userstatistics?user="+data.user+"&network="+data.user_network;
    }

    getStatisticsURLTo(data:any) : string {
        return window.location.origin+"/userstatistics?user="+data.to+"&network="+data.to_network;
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
            return 'berta'
        else if('coil'===tipper.network)
            return 'coil'
        else if('twitter'===tipper.network)
            return 'emil'
        else return 'emil';
    }
}