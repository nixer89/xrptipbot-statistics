import { Injectable } from '@angular/core';
import { AppService } from './app.service';

@Injectable()
export class ApiService {
    constructor(private app: AppService) {}

    isTestMode = false;
    baseUrlToUse = this.isTestMode ? 'http://localhost:4000' : 'https://api.xrptipbot-stats.com';

    //################################# CALL API METHODS #################################
    async callTipBotPublicPage(user: string, network: string): Promise<any> {
        try {
            return this.app.get('https://www.xrptipbot.com/u:'+user+'/n:'+network+'/f:json');
        } catch(err) {
            console.log(JSON.stringify(err))
            return [];
        }
    }

    async callTipBotFeedApi(queryParams: string): Promise<any[]> {
        let receivedTips: any[]

        try {
            //console.log("calling API: " + "https://api.xrptipbot-stats.com/feed?"+queryParams)
            let tipbotFeed = await this.app.get(this.baseUrlToUse+"/feed?"+queryParams);
            //console.log("feed length: " + tipbotFeed.feed.length);
            receivedTips = tipbotFeed.feed;
        } catch(err) {
            console.log(JSON.stringify(err))
            receivedTips = [];
        }

        return receivedTips;
    }

    async callTipBotILPFeedApi(queryParams: string): Promise<any[]> {
        let receivedTips: any[]

        try {
            //console.log("calling API: " + "https://api.xrptipbot-stats.com/feed?"+queryParams)
            let tipbotFeed = await this.app.get(this.baseUrlToUse+"/std-ilp-feed?"+queryParams);
            //console.log("feed length: " + tipbotFeed.feed.length);
            receivedTips = tipbotFeed.feed;
        } catch(err) {
            console.log(JSON.stringify(err))
            receivedTips = [];
        }

        return receivedTips;
    }

    async callTipBotStandarizedFeedApi(queryParams: string): Promise<any[]> {
        let receivedTips: any[]

        try {
            //console.log("calling API: " + "https://api.xrptipbot-stats.com/feed?"+queryParams)
            let tipbotFeed = await this.app.get(this.baseUrlToUse+"/std-feed?"+queryParams);
            //console.log("feed length: " + tipbotFeed.feed.length);
            receivedTips = tipbotFeed.feed;
        } catch(err) {
            console.log(JSON.stringify(err))
            receivedTips = [];
        }

        return receivedTips;
    }

    private async callTipBotCountApi(path: string, queryParams: string): Promise<any> {
        try {
            //console.log("calling API: " + "https://api.xrptipbot-stats.com/count"+path+"?"+queryParams)
            return this.app.get(this.baseUrlToUse+"/count"+path+"?"+queryParams);
        } catch(err) {
            console.log(JSON.stringify(err))
            return null;
        }
    }

    
    private async callTipBotAggregateApi(path:string, queryParams: string): Promise<any> {
        try {
            //console.log("calling API: " + "https://api.xrptipbot-stats.com/aggregate"+path+"?"+queryParams)
            return this.app.get(this.baseUrlToUse+"/aggregate"+path+"?"+queryParams);
        } catch(err) {
            console.log(JSON.stringify(err))
            return null;
        }
    }

    private async callTipBotAggregateILPApi(path:string, queryParams: string): Promise<any> {
        try {
            console.log("calling API: " + this.baseUrlToUse+"/aggregate-ilp"+path+(queryParams ? "?"+queryParams : ""))
            return this.app.get(this.baseUrlToUse+"/aggregate-ilp"+path+(queryParams ? "?"+queryParams : ""));
        } catch(err) {
            console.log(JSON.stringify(err))
            return null;
        }
    }

    //################################# CALL API METHODS END #################################


    //################################# WRAPPER METHODS #################################

    async getCount(queryParams: string): Promise<number> {
        let countResult = await this.callTipBotCountApi("", queryParams);

        if(countResult) return countResult.count;
        else return 0;
    }

    async getCountResult(path:string, queryParams: string): Promise<[]> {
        //console.log(" count with path: " + path + " and filter: " + queryParams)
        let countResult = await this.callTipBotCountApi(path, queryParams);

        if(countResult) return countResult.result;
        else return [];
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

    async getILPDepositXRP(queryParams: string): Promise<number> {
        let ilpDeposits = await this.callTipBotILPFeedApi(queryParams);


        if(ilpDeposits && ilpDeposits.length>0) {
            let culmulatedXRP = 0;
            for(let i = 0; i < ilpDeposits.length;i++) {
                culmulatedXRP+= ilpDeposits[i].amount;
            }

            return culmulatedXRP/1000000;
        } else {
            return 0;
        }
    }

    async getAggregatedXRPILP(queryParams: string): Promise<number> {
        let aggregateResult = await this.callTipBotAggregateILPApi("/xrp", queryParams);

        if(aggregateResult) return aggregateResult.amount;
        else return 0;
    }

    async getAggregatedILPResult(path:string, queryParams: string): Promise<[]> {
        let aggregateResult = await this.callTipBotAggregateILPApi(path, queryParams);

        if(aggregateResult) return aggregateResult.result;
        else return [];
    }

    async getCurrentBalance(user: string, network: string): Promise<number> {
        let currentBalance = null;
        if(user && user.trim().length>0 && network && network.trim().length >0) {
            let publicFeed = await this.callTipBotPublicPage(user, network);
            if(publicFeed && publicFeed.stats && publicFeed.stats.balance) {
                currentBalance = publicFeed.stats.balance.amount+"";
            }
        }

        return currentBalance;
    }

    async getTipbotAccountInfo(user: string, network: string): Promise<any> {
        let tipbotCreated = {};
        if(user && user.trim().length>0 && network && network.trim().length >0) {
            let publicFeed = await this.callTipBotPublicPage(user, network);
            if(publicFeed && publicFeed.user) {

                if(publicFeed.user.rejecttips)
                    tipbotCreated['rejecttips'] = publicFeed.user.rejecttips;
                    
                if(publicFeed.user.tipbot_created)
                    tipbotCreated['tipbot_created'] = publicFeed.user.tipbot_created;
            }
        }

        return tipbotCreated;
    }

    //################################# WRAPPER METHODS END #################################

    async getUser(userHandle:string, network:string): Promise<any> {
        let user = {
            id:null,
            name: null,
            network: network
        }

        try {
            //checking first if the user has any deposits, withdraws or sent out any tips on his network
            let userIdResult = await this.callTipBotStandarizedFeedApi('user='+userHandle+"&network="+network+"&limit=1&result_fields=user_id,user");
            if(userIdResult && userIdResult.length>0) {
                user.id = userIdResult[0].user_id;
                user.name = userIdResult[0].user;
                return user;
            }

            //checking if the user received any tips within the same network
            userIdResult = await this.callTipBotStandarizedFeedApi('to='+userHandle+"&network="+network+"&limit=1&result_fields=to_id,to");
            if(userIdResult && userIdResult.length>0) {
                user.id = userIdResult[0].to_id;
                user.name = userIdResult[0].to;
                return user;
            }

            //checking first tips TO the user via another network
            userIdResult = await this.callTipBotStandarizedFeedApi('to='+userHandle+"&to_network="+network+"&limit=1&result_fields=to_id,to");
            //console.log("checked cross network 1");
            if(userIdResult && userIdResult.length>0) {
                user.id = userIdResult[0].to_id;
                user.name = userIdResult[0].to;
                return user;
            }

            //checking next tips FROM the user via another network
            userIdResult = await this.callTipBotStandarizedFeedApi('user='+userHandle+"&user_network="+network+"&limit=1&result_fields=user_id,user");
            //console.log("checked cross network 2");
            if(userIdResult && userIdResult.length>0) {
                user.id = userIdResult[0].user_id;
                user.name = userIdResult[0].user;
                return user;
            }

            //if no match, try to check for the ID?!
            //checking first if the user has any deposits, withdraws or sent out any tips on his network
            userIdResult = await this.callTipBotStandarizedFeedApi('user_id='+userHandle+"&network="+network+"&limit=1&result_fields=user_id,user");
            if(userIdResult && userIdResult.length>0) {
                user.id = userIdResult[0].user_id;
                user.name = userIdResult[0].user;
                return user;
            }

            //checking if the user received any tips within the same network
            userIdResult = await this.callTipBotStandarizedFeedApi('to_id='+userHandle+"&network="+network+"&limit=1&result_fields=to_id,to");
            if(userIdResult && userIdResult.length>0) {
                user.id = userIdResult[0].to_id;
                user.name = userIdResult[0].to;
                return user;
            }

            //checking first tips TO the user via another network
            userIdResult = await this.callTipBotStandarizedFeedApi('to_id='+userHandle+"&to_network="+network+"&limit=1&result_fields=to_id,to");
            //console.log("checked cross network 1");
            if(userIdResult && userIdResult.length>0) {
                user.id = userIdResult[0].to_id;
                user.name = userIdResult[0].to;
                return user;
            }

            //checking next tips FROM the user via another network
            userIdResult = await this.callTipBotStandarizedFeedApi('user_id='+userHandle+"&user_network="+network+"&limit=1&result_fields=user_id,user");
            //console.log("checked cross network 2");
            if(userIdResult && userIdResult.length>0) {
                user.id = userIdResult[0].user_id;
                user.name = userIdResult[0].user;
                return user;
            }

            //checking ILP to the user
            userIdResult = await this.callTipBotILPFeedApi('user='+userHandle+"&network="+network+"&limit=1&result_fields=user_id,user");
            //console.log("checked cross network 2");
            if(userIdResult && userIdResult.length>0) {
                user.id = userIdResult[0].user_id;
                user.name = userIdResult[0].user;
                return user;
            }

            //checking ILP to the user-id
            userIdResult = await this.callTipBotILPFeedApi('user_id='+userHandle+"&network="+network+"&limit=1&result_fields=user_id,user");
            //console.log("checked cross network 2");
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
            userNameResult = await this.callTipBotStandarizedFeedApi("user_id="+userIdToLookFor+toInteractionFilter+"&limit=1&result_fields=user,network,user_id,user_network");
            if(userNameResult && userNameResult.length>0)
                return userNameResult[0];
            else {
                userNameResult = await this.callTipBotStandarizedFeedApi("to_id="+userIdToLookFor+userInteractionFilter+"&limit=1&result_fields=to,network,to_id,to_network");
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