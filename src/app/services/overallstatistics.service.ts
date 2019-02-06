import { Injectable } from '@angular/core';
import { AppService } from './app.service';

@Injectable()
export class OverallStatisticsService {

    constructor(private app: AppService) {}

    async callTipBotApi(queryparams?: string): Promise<any[]> {
        let receivedTips: any[]

        try {
            console.log("calling API: " + "https://xrptipbot-api.siedentopf.xyz/feed")
            console.time("apiRequestTime");
            let tipbotFeed = await this.app.get("https://xrptipbot-api.siedentopf.xyz/feed"+ (queryparams?"?"+queryparams:""));
            console.timeEnd("apiRequestTime");
            receivedTips = tipbotFeed.feed;
        } catch {
            receivedTips = [];
        }

        return receivedTips;
    }

    async getOverallStatistics(): Promise<any[]> {
        let receivedTips:any[] = [];
        console.log("#### starting new requests");
        receivedTips = await this.callTipBotApi("result_fields=to_id xrp");
        console.log("received tips: " + receivedTips.length);

        return [this.getMostXRPReceived(receivedTips), this.getMostTipsReceived(receivedTips)];
    }

    private getMostXRPReceived(receivedTips:any[]) : any[] {
        let mostXRPReceived:any = {};
        let mostXRPReceivedArray:any[] = [];

        for(let tip of receivedTips) {
            if(!mostXRPReceived[tip.to_id]) {
                mostXRPReceived[tip.to_id] = tip.xrp;
            }
            else {
                mostXRPReceived[tip.to] = (mostXRPReceived[tip.to]*1000000+tip.xrp*1000000)/1000000
            }
        };

        console.log(JSON.stringify(mostXRPReceived));

        for (const prop of mostXRPReceived) {
            console.log("having a property: " + prop);
            if (mostXRPReceived.hasOwnProperty(prop)) {
                mostXRPReceivedArray.push({user_id: prop.key, xrp: prop.value})
            }
        }

        return mostXRPReceivedArray.sort((userA, userB) => userA.xrp - userB.xrp).slice(0,20);
    }

    private getMostTipsReceived(receivedTips:any[]) : any[] {
        let mostTipsReceived:any = {};
        let mostTipsReceivedArray:any[] = [];

        for(let tip of receivedTips) {
            if(!mostTipsReceived[tip.to]) {
                mostTipsReceived[tip.to] = 1;
            }
            else {
                mostTipsReceived[tip.to]++;
            }
        };

        for (let prop of mostTipsReceived) {
            if (mostTipsReceived.hasOwnProperty(prop)) {
                mostTipsReceivedArray.push({user_id: prop.label, tips: prop.value})
            }
        }

        return mostTipsReceivedArray.sort((userA, userB) => userA.tips - userB.tips).slice(0,20);
    }
}
