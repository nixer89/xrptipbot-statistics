import { Component, Input, OnInit } from "@angular/core";
import { ApiService } from '../services/api.service';

@Component({
    selector: "transactionTable",
    templateUrl: "transactionTable.html"
})
export class TransactionTableComponent implements OnInit {

    @Input()
    transactionFilter:string;

    data:any[];

    constructor(private api: ApiService) {

    }

    async ngOnInit() {
        console.log("getting transactions");
        this.data = await this.api.callTipBotStandarizedFeedApi(this.transactionFilter.trim());
    }

    cleanup() {
        this.transactionFilter = null;
        this.data = null;
    }

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
}