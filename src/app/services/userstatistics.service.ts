import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable()
export class UserStatisticsService {

    constructor(private api: ApiService) {}

    async calculateBalances(charity:string): Promise<any[]> {
        try {
            let tipbotFeed = await this.api.callTipBotPublicPage(charity);
            let stats = tipbotFeed.stats;
            let xprcharitiesRaised = stats.tips.received.amount + stats.donations.deposits.amount + stats.donations.ilpDeposits.amount;
            xprcharitiesRaised = new Number(xprcharitiesRaised.toFixed(6));

            return [tipbotFeed.stats.balance.amount,xprcharitiesRaised];
        } catch {
            return [0,0];
        }
    }

    async getSentTipsOfLastDaysForUser(days:number, userId: string): Promise<any[]> {
        let sentTips:any[] = [];
        let checkUntilDate = new Date();
        checkUntilDate.setDate(checkUntilDate.getDate()-days-7);
        checkUntilDate = this.setZeroTime(checkUntilDate);

        let queryParamsTips = "user_id="+userId+"&type=tip&from_date="+checkUntilDate.toUTCString();
        sentTips = await this.api.callTipBotFeedApi(queryParamsTips);

        //console.log("sentTips: " + JSON.stringify(sentTips));
        return sentTips;
    }

    async getReceivedTipsOfLastDaysForUser(days:number, userId: string, includeDeposits:boolean): Promise<any[]> {
        let receivedTips:any[] = [];
        let receivedDeposits:any[] = [];
        let checkUntilDate = new Date();
        checkUntilDate.setDate(checkUntilDate.getDate()-days-7);
        checkUntilDate = this.setZeroTime(checkUntilDate);

        let queryParamsTips = "to_id="+userId+"&from_date="+checkUntilDate.toUTCString();
        receivedTips = await this.api.callTipBotFeedApi(queryParamsTips);

        if(includeDeposits) {
            let queryParamsDeposit= "user_id="+userId+"&type=deposit&from_date="+checkUntilDate.toUTCString();
            receivedDeposits = await this.api.callTipBotFeedApi(queryParamsDeposit);

            receivedTips = receivedTips.concat(receivedDeposits).sort((a,b) => {
                let momentA = new Date(a.momentAsDate);
                let momentB = new Date(b.momentAsDate);

                if(momentA < momentB) return 1;
                else return -1;
            
            });
        }

        //console.log("receivedTips: " + JSON.stringify(receivedTips));
        return receivedTips;
    }

    aggregateNumbersForXRP(receivedTips: any[], days: number, multiplier: number) : any[] {
        //console.log("days: " + days + " and multiplier: " + multiplier);
        
        let upperDate = new Date();
        let nextLowDate = new Date();
        //next low day should be last monday if we calculate weeks
        if(multiplier==7)
            nextLowDate.setDate(nextLowDate.getDate() - (nextLowDate.getDay()==0 ? 7 : nextLowDate.getDay())+1);

        nextLowDate = this.setZeroTime(nextLowDate);

        let lowestDate = new Date();
        if(multiplier==7) {
            let daysToMonday = lowestDate.getDay()-1;
            lowestDate.setDate(lowestDate.getDate() - ((days-1)*multiplier+daysToMonday));
        } else {
            lowestDate.setDate(lowestDate.getDate() - days*multiplier+1);
        }
        lowestDate = this.setZeroTime(lowestDate);

        let timesDateLowered = 0;

        let dataXRP:number[] = [];
        let dataTimes:any[]=[];

        //init arrays:
        dataXRP.push(0);
        dataTimes.push({from: nextLowDate.toDateString(), to: upperDate.toDateString()})

        receivedTips.forEach(tip => {
            let tipDate = new Date(tip.moment);

            if(tipDate > lowestDate) {
                //add empty entries when tipdate smaller than nextLowDate!
                while(tipDate < nextLowDate) {
                    //no entry yet -> add an empty one!
                    upperDate = new Date(nextLowDate);
                    upperDate.setDate(upperDate.getDate()-2)
                    upperDate = this.setHigherTime(upperDate);
                    nextLowDate.setDate(nextLowDate.getDate()-multiplier);
                    nextLowDate = this.setZeroTime(nextLowDate);

                    dataXRP.push(0)
                    dataTimes.push({from: nextLowDate.toDateString(), to: upperDate.toDateString()})
                    timesDateLowered++;
                }

                //ok, tip is in correct time frame -> add it!
                if(tipDate > nextLowDate) {
                    if(dataXRP.length<=days) {
                        dataXRP[timesDateLowered]+=tip.xrp*1000000;
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
            dataTimes.push({from: nextLowDate.toDateString(), to: upperDate.toDateString()})
            
            upperDate = nextLowDate;
            nextLowDate.setDate(nextLowDate.getDate()-multiplier);
        }

        if(dataTimes && dataTimes.length>0 && !dataTimes[dataTimes.length-1].from)
            dataTimes[dataTimes.length-1].from = dataTimes[dataTimes.length-1].to;

        for(let i = 0; i < dataXRP.length;i++)
            dataXRP[i] = dataXRP[i]/1000000;

        //console.log("returning dataXRP: " + JSON.stringify(dataXRP));
        //console.log("returning dataTimes: " + JSON.stringify(dataTimes));
        return [dataXRP,dataTimes];
    }

    async getTopTipperReceived(userHandle: string): Promise<any[]> {
        let userId:any[]= [];
        //console.log("#### staring new getReceivedTipsOfLastDaysForUser request");
        let queryParams = "to="+userHandle+"&limit=1";
        userId = await this.api.callTipBotFeedApi(queryParams);

        if(userId && userId.length >1) {
            //console.log("userId array: " + JSON.stringify(userId));
            //query api for tips sent to user and only select where tips came from (user_id) and how much (xrp)
            let queryParams2 = "to_id="+userId[0].user_id+"&result_fields=user_id xrp";
            let receivedTipsOverall = userId = await this.api.callTipBotFeedApi(queryParams2);

            //console.log("receivedTipsOverall" + JSON.stringify(receivedTipsOverall));

            for(let tip in receivedTipsOverall) {

            }
        }
        return null;
    }

    async getUserStats(userId:string): Promise<number[]> {
        let emptyResult:number[];
        //console.log("getUserStats")
        try {
            if(userId && userId.trim().length>0) {
                let promises:any[] = [];
                //received tips
                promises.push(this.api.getCount("to_id="+userId+"&type=tip"));
                //received tips XRP
                promises.push(this.api.getAggregatedXRP("to_id="+userId+"&type=tip"));
                //sent tips
                promises.push(this.api.getCount("user_id="+userId+"&type=tip"));
                //sent tips XRP
                promises.push(this.api.getAggregatedXRP("user_id="+userId+"&type=tip"));
                //deposits
                promises.push(this.api.getCount("user_id="+userId+"&type=deposit"));
                //deposits XRP
                promises.push(this.api.getAggregatedXRP("user_id="+userId+"&type=deposit"));
                //withdraw
                promises.push(this.api.getCount("user_id="+userId+"&type=withdraw"));
                //withdraw XRP
                promises.push(this.api.getAggregatedXRP("user_id="+userId+"&type=withdraw"));

                return Promise.all(promises);
            }
        } catch(err) {
            console.log(err);
            return emptyResult;
        }

        return emptyResult;
    }

    async getTopTipper(userId:string): Promise<any[]> {
        let emptyResult:number[];
        //console.log("getTopTipper")
        try {
            //get userid first!
            if(userId && userId.trim().length>0) {
                let promises:any[] = [];
                //received tips
                promises.push(this.api.getCountResult("/mostReceivedFrom","to_id="+userId+"&type=tip&limit=10"));
                //sent tips
                promises.push(this.api.getCountResult("/mostSentTo","user_id="+userId+"&type=tip&limit=10"));
                //received tips XRP
                promises.push(this.api.getAggregatedResult("/xrp/mostReceivedFrom","to_id="+userId+"&type=tip&limit=10"));
                //sent tips XRP
                promises.push(this.api.getAggregatedResult("/xrp/mostSentTo","user_id="+userId+"&type=tip&limit=10"));

                let promiseResult = await Promise.all(promises);
                //console.log("promiseResult: " + JSON.stringify(promiseResult));

                let resolveUserNamesPromiseAll:any[] = [];

                for(let i = 0; i < promiseResult.length; i++) {
                    let singleResult:any[] = promiseResult[i];
                    //console.log("singleResult: " + JSON.stringify(singleResult));
                    let promises2: any[] = [];
                    for(let j = 0; j < singleResult.length; j++)
                        promises2.push(this.api.getUserName(singleResult[j]['_id']));

                        resolveUserNamesPromiseAll.push(Promise.all(promises2));
                }

                let resolveUserNamesPromiseAllResult = await Promise.all(resolveUserNamesPromiseAll);

                for(let i = 0; i < resolveUserNamesPromiseAllResult.length; i++) {
                    let singleResult:any[] = resolveUserNamesPromiseAllResult[i];
                    for(let k = 0; k < singleResult.length; k++) {
                        promiseResult[i][k]['_id']=singleResult[k];
                        if(promiseResult[i][k]['xrp'])
                            promiseResult[i][k]['xrp']=promiseResult[i][k]['xrp'].toFixed(6);
                    }   
                }

                return promiseResult;
            }
        } catch(err) {
            console.log(err);
            return emptyResult;
        }

        return emptyResult;
    }

    private setZeroTime(dateToModify: Date): Date {
        dateToModify.setHours(0);
        dateToModify.setMinutes(0);
        dateToModify.setSeconds(0);
        dateToModify.setMilliseconds(0);

        return dateToModify;
    }
    
    private setHigherTime(dateToModify: Date): Date {
        dateToModify.setHours(23);
        dateToModify.setMinutes(59);
        dateToModify.setSeconds(59);
        dateToModify.setMilliseconds(999999);

        return dateToModify;
    }
}
