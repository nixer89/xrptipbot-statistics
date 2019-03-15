import { Injectable } from '@angular/core';
import { AppService } from './app.service';

@Injectable()
export class ApiService {
    constructor(private app: AppService) {}

    isTestMode = true;
    baseUrlToUse = this.isTestMode ? 'http://localhost:4000' : 'https://xrptipbot-api.siedentopf.xyz';

    async callTipBotFeedApi(queryParams: string): Promise<any[]> {
        let receivedTips: any[]

        try {
            //console.log("calling API: " + "https://xrptipbot-api.siedentopf.xyz/feed?"+queryParams)
            let tipbotFeed = await this.app.get(this.baseUrlToUse+"/feed?"+queryParams);
            //console.log("feed length: " + tipbotFeed.feed.length);
            receivedTips = tipbotFeed.feed;
        } catch(err) {
            console.log(JSON.stringify(err))
            receivedTips = [];
        }

        return receivedTips;
    }

    async getCount(queryParams: string): Promise<number> {
        let countResult = await this.callTipBotCountApi("", queryParams);

        if(countResult) return countResult.count;
        else return 0;
    }

    async getCountResult(path:string, queryParams: string): Promise<[]> {
        let countResult = await this.callTipBotCountApi(path, queryParams);

        if(countResult) return countResult.result;
        else return [];
    }

    private async callTipBotCountApi(path: string, queryParams: string): Promise<any> {
        try {
            //console.log("calling API: " + "https://xrptipbot-api.siedentopf.xyz/count"+path+"?"+queryParams)
            return this.app.get(this.baseUrlToUse+"/count"+path+"?"+queryParams);
        } catch(err) {
            console.log(JSON.stringify(err))
            return null;
        }
    }

    async getAggregatedXRP(queryParams: string): Promise<number> {
        let aggregateResult = await this.callTipBotAggregateApi("/xrp", queryParams);

        if(aggregateResult) return aggregateResult.xrp;
        else return 0;
    }

    async getAggregatedResult(path:string, queryParams: string): Promise<[]> {
        let aggregateResult = await this.callTipBotAggregateApi(path, queryParams);

        if(aggregateResult) return aggregateResult.result;
        else return [];
    }

    private async callTipBotAggregateApi(path:string, queryParams: string): Promise<any> {
        try {
            //console.log("calling API: " + "https://xrptipbot-api.siedentopf.xyz/aggregate"+path+"?"+queryParams)
            return this.app.get(this.baseUrlToUse+"/aggregate"+path+"?"+queryParams);
        } catch(err) {
            console.log(JSON.stringify(err))
            return null;
        }
    }

    async callTipBotPublicPage(user: string): Promise<any> {
        try {
            return this.app.get('https://www.xrptipbot.com/u:'+user+'/n:twitter/f:json');
        } catch(err) {
            console.log(JSON.stringify(err))
            return [];
        }
    }

    async getUser(userHandle:string, network:string): Promise<any> {
        let user = {
            id:null,
            name: null,
            network: network
        }
        let userFilter = network === 'discord' ? 'user_id=' : 'user=';
        let toFilter = network === 'discord' ? 'to_id=' : 'to=';
        try {
            //checking first if the user has any deposits, withdraws or sent out any tips on his network
            let userIdResult = await this.callTipBotFeedApi(userFilter+userHandle+"&network="+network+"&limit=1&result_fields=user_id,user");
            if(userIdResult && userIdResult.length>0) {
                user.id = userIdResult[0].user_id;
                user.name = userIdResult[0].user;
                return user;
            }

            //checking if the user received any tips within the same network
            userIdResult = await this.callTipBotFeedApi(toFilter+userHandle+"&network="+network+"&limit=1&result_fields=to_id,to");
            if(userIdResult && userIdResult.length>0) {
                user.id = userIdResult[0].to_id;
                user.name = userIdResult[0].to;
                return user;
            }

            //checking first tips TO the user via another network
            userIdResult = await this.callTipBotFeedApi(toFilter+userHandle+"&to_network="+network+"&limit=1&result_fields=to_id,to");
            console.log("checked cross network 1");
            if(userIdResult && userIdResult.length>0) {
                user.id = userIdResult[0].to_id;
                user.name = userIdResult[0].to;
                return user;
            }

            //checking next tips FROM the user via another network
            userIdResult = await this.callTipBotFeedApi(userFilter+userHandle+"&user_network="+network+"&limit=1&result_fields=user_id,user");
            console.log("checked cross network 2");
            if(userIdResult && userIdResult.length>0) {
                user.id = userIdResult[0].user_id;
                user.name = userIdResult[0].user;
                return user;
            }

            return null;
            
        } catch(err) {
            console.log(err);
            return null;
        }
    }

    async getUserNameAndNetwork(userIdToLookFor:string, userIdInteractedWith:string, userNameInteractedWith:string): Promise<string> {
        let userNameResult:any[];
        let userInteractionFilter = userIdInteractedWith ? "&user_id="+userIdInteractedWith : (userNameInteractedWith ? "&user="+userNameInteractedWith : "")
        let toInteractionFilter = userIdInteractedWith ? "&to_id="+userIdInteractedWith : (userIdInteractedWith ? "&to="+userIdInteractedWith : "")
        try {
            userNameResult = await this.callTipBotFeedApi("user_id="+userIdToLookFor+toInteractionFilter+"&limit=1&result_fields=user,network,user_id,user_network");
            if(userNameResult && userNameResult.length>0)
                return userNameResult[0];
            else {
                userNameResult = await this.callTipBotFeedApi("to_id="+userIdToLookFor+userInteractionFilter+"&limit=1&result_fields=to,network,to_id,to_network");
                if(userNameResult && userNameResult.length>0)
                    return userNameResult[0];
                else return ""
            }
        } catch(err) {
            console.log(err);
            return "";
        }
    }
}