import { Injectable } from '@angular/core';
import { AppService } from './app.service';

@Injectable()
export class UserStatisticsService {

    constructor(private app: AppService) {}

    async calculateBalances(charity:string): Promise<any[]> {
        try {
            let tipbotFeed = await this.app.get('https://www.xrptipbot.com/u:'+charity+'/n:twitter/f:json');
            let stats = tipbotFeed.stats;
            let xprcharitiesRaised = stats.tips.received.amount + stats.donations.deposits.amount + stats.donations.ilpDeposits.amount;
            xprcharitiesRaised = new Number(xprcharitiesRaised.toFixed(6));

            return [tipbotFeed.stats.balance.amount,xprcharitiesRaised];
        } catch {
            return [0,0];
        }
    }

    async getReceivedTipsOfLastDaysForUser(days:number, userHandle: string): Promise<any[]> {
        let receivedTips:any[] = [];
        let checkUntilDate = new Date();
        checkUntilDate.setDate(checkUntilDate.getDate()-days);
        checkUntilDate = this.getZeroTimeDate(checkUntilDate);

        console.log("#### staring new getReceivedTipsOfLastDaysForUser request");
        let queryParams = "to="+userHandle+"&from_date="+checkUntilDate.toUTCString();
        receivedTips = await this.callTipBotFeedApi(queryParams);

        return receivedTips;
    }

    aggregateNumbersForXRP(receivedTips: any[], days: number, multiplier: number) : any[] {
        console.log("days: " + days + " and multiplier: " + multiplier);
        //console.log("received tips first: " + receivedTips[0].moment);
        //console.log("received tips last: " + receivedTips[receivedTips.length-1].moment);
        
        let upperDate = new Date();
        let nextLowDate = new Date();
        //next low day should be last sunday if we calculate weeks
        if(multiplier==7)
            nextLowDate.setDate(nextLowDate.getDate() - nextLowDate.getDay()+1);

        nextLowDate = this.getZeroTimeDate(nextLowDate);

        let lowestDate = new Date();
        if(multiplier==7) {
            let daysToMonday = lowestDate.getDay()-1;
            lowestDate.setDate(lowestDate.getDate() - ((days-1)*multiplier+daysToMonday));
        } else {
            lowestDate.setDate(lowestDate.getDate() - days*multiplier+1);
        }
        lowestDate = this.getZeroTimeDate(lowestDate);

        let timesDateLowered = 0;

        let dataXRP:number[] = [];
        let dataTips:number[] = [];
        let dataTimes:any[]=[];

        //init arrays:
        dataXRP.push(0)
        dataTips.push(0);
        dataTimes.push({from: nextLowDate.toDateString(), to: upperDate.toDateString()})

        receivedTips.forEach(tip => {
            let tipDate = new Date(tip.moment);

            if(tipDate > lowestDate) {
                //add empty entries when tipdate smaller than nextLowDate!
                while(tipDate < nextLowDate) {
                    //no entry yet -> add an empty one!
                    upperDate.setDate(nextLowDate.getDate()-1)
                    nextLowDate.setDate(nextLowDate.getDate()-multiplier);
                    dataXRP.push(0)
                    dataTips.push(0);
                    dataTimes.push({from: nextLowDate.toDateString(), to: upperDate.toDateString()})
                    timesDateLowered++;
                }

                //ok, tip is in correct time frame -> add it!
                if(tipDate > nextLowDate) {
                    if(dataXRP.length<=days) {
                        dataXRP[timesDateLowered]+=tip.xrp*1000000;
                        dataTips[timesDateLowered]+=1;
                    }
                }
            } else {
                return;
            }
        });

        //reduce one to get a new array field
        upperDate=nextLowDate;
        nextLowDate.setDate(nextLowDate.getDate()-multiplier);

        while(dataXRP.length<days) {
            dataXRP.push(0)
            dataTips.push(0);
            dataTimes.push({from: nextLowDate.toDateString(), to: upperDate.toDateString()})
            
            upperDate = nextLowDate;
            nextLowDate.setDate(nextLowDate.getDate()-multiplier);
        }

        if(dataTimes && dataTimes.length>0 && !dataTimes[dataTimes.length-1].from)
            dataTimes[dataTimes.length-1].from = dataTimes[dataTimes.length-1].to;

        for(let i = 0; i < dataXRP.length;i++)
            dataXRP[i] = dataXRP[i]/1000000;

        console.log("returning dataXRP: " + JSON.stringify(dataXRP));
        console.log("returning dataTips: " + JSON.stringify(dataTips));
        console.log("returning dataTimes: " + JSON.stringify(dataTimes));
        return [dataXRP,dataTips,dataTimes];
    }

    async getTopTipperReceived(userHandle: string): Promise<any[]> {
        let userId:any[]= [];
        console.log("#### staring new getReceivedTipsOfLastDaysForUser request");
        let queryParams = "to="+userHandle+"&limit=1";
        userId = await this.callTipBotFeedApi(queryParams);

        if(userId && userId.length >1) {
            console.log("userId array: " + JSON.stringify(userId));
            //query api for tips sent to user and only select where tips came from (user_id) and how much (xrp)
            let queryParams2 = "to_id="+userId[0].user_id+"&result_fields=user_id xrp";
            let receivedTipsOverall = userId = await this.callTipBotFeedApi(queryParams2);

            console.log("receivedTipsOverall" + JSON.stringify(receivedTipsOverall));

            for(let tip in receivedTipsOverall) {

            }
        }
        return null;
    }

    async getUserStats(userHandle:string): Promise<number[]> {
        let result:number[];
        console.log("getting")
        try {
            //get userid first!
            let userId = await this.getUserId(userHandle);
            if(userId && userId.trim().length>0) {
                let result:number[] = [];
                //received tips
                result.push(await this.callTipBotCountApi("to_id="+userId+"&type=tip"));
                //sent tips
                result.push(await this.callTipBotCountApi("user_id="+userId+"&type=tip"));
                //deposits
                result.push(await this.callTipBotCountApi("user_id="+userId+"&type=deposit"));
                //withdraw
                result.push(await this.callTipBotCountApi("user_id="+userId+"&type=withdraw"));

                console.log("user stats result: " + JSON.stringify(result));
                return result;

            }
        } catch(err) {
            console.log(err);
            return result;
        }

        return result;
    }

    private async callTipBotCountApi(queryParams: string): Promise<number> {
        let count: number
        try {
            console.log("calling API: " + "https://xrptipbot-api.siedentopf.xyz/count?"+queryParams)
            let countResult = await this.app.get("https://xrptipbot-api.siedentopf.xyz/count?"+queryParams);
            count = countResult.count;
        } catch {
            count = 0;
        }

        return count;
    }

    private async getUserId(userHandle:string): Promise<string> {
        let userIdResult:any[];
        try {
            userIdResult = await this.callTipBotFeedApi("user="+userHandle+"&limit=1&result_fields=user_id");
            if(userIdResult && userIdResult.length>0)
                return userIdResult[0].user_id;
            else {
                userIdResult = await this.callTipBotFeedApi("to="+userHandle+"&limit=1&result_fields=to_id");
                if(userIdResult && userIdResult.length>0)
                    return userIdResult[0].to_id;
                else return ""
            }
        } catch(err) {
            console.log(err);
            return "";
        }
    }

    private async callTipBotFeedApi(queryParams: string): Promise<any[]> {
        let receivedTips: any[]

        try {
            console.log("calling API: " + "https://xrptipbot-api.siedentopf.xyz/feed?"+queryParams)
            let tipbotFeed = await this.app.get("https://xrptipbot-api.siedentopf.xyz/feed?"+queryParams);
            console.log("feed length: " + tipbotFeed.feed.length);
            receivedTips = tipbotFeed.feed;
        } catch {
            receivedTips = [];
        }

        return receivedTips;
    }

    private getZeroTimeDate(dateToModify: Date): Date {
        dateToModify.setHours(0);
        dateToModify.setMinutes(0);
        dateToModify.setSeconds(0);
        dateToModify.setMilliseconds(0);

        return dateToModify;
    }
}
