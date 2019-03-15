import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable()
export class GeneralStatisticsService {

    constructor(private api: ApiService) {}

    async getTopTipper(fromDate: Date, toDate: Date, network:string, userId?:string, userName?:string): Promise<any[]> {
        try {
            let userFilter = userId ? "&user_id="+userId : (userName ? "&user="+userName : "")
            let toFilter = userId ? "&to_id="+userId : (userName ? "&to="+userName : "")
            let optionalDateFilter = "";
            if(fromDate && toDate) {
                optionalDateFilter+="&from_date="+this.setZeroMilliseconds(fromDate).toUTCString();
                optionalDateFilter+="&to_date="+this.setHighMilliseconds(toDate).toUTCString();
            }
            let promises:any[] = [];
            //received tips
            promises.push(this.api.getCountResult("/mostReceivedFrom","type=tip&limit=11"+optionalDateFilter+toFilter));
            //sent tips
            promises.push(this.api.getCountResult("/mostSentTo","type=tip&limit=11"+optionalDateFilter+userFilter));
            //received tips XRP
            promises.push(this.api.getAggregatedResult("/xrp/mostReceivedFrom","type=tip&limit=11"+optionalDateFilter+toFilter));
            //sent tips XRP
            promises.push(this.api.getAggregatedResult("/xrp/mostSentTo","type=tip&limit=11"+optionalDateFilter+userFilter));

            let promiseResult = await Promise.all(promises);
            //console.log("promiseResult: " + JSON.stringify(promiseResult));

            let resolveUserNamesPromiseAll:any[] = [];

            for(let i = 0; i < promiseResult.length; i++) {
                promiseResult[i] = promiseResult[i].filter(user => user['_id']!="1069586402898337792");
                if(promiseResult[i].length > 10)
                    promiseResult[i].pop();
            }

            for(let i = 0; i < promiseResult.length; i++) {
                let singleResult:any[] = promiseResult[i];
                //console.log("singleResult " + i + ": " + JSON.stringify(singleResult));
                let promises2: any[] = [];
                for(let j = 0; j < singleResult.length; j++)
                    promises2.push(this.api.getUserNameAndNetwork(singleResult[j]['_id'], userId, userName));

                    resolveUserNamesPromiseAll.push(Promise.all(promises2));
            }

            let resolveUserNamesPromiseAllResult = await Promise.all(resolveUserNamesPromiseAll);

            for(let i = 0; i < resolveUserNamesPromiseAllResult.length; i++) {
                let singleResult:any[] = resolveUserNamesPromiseAllResult[i];
                for(let k = 0; k < singleResult.length; k++) {
                    promiseResult[i][k]['_id']=singleResult[k].user ? singleResult[k].user : singleResult[k].to;
                    promiseResult[i][k]['user_id']=singleResult[k].user_id;
                    promiseResult[i][k]['to_id']=singleResult[k].to_id;

                    if(singleResult[k].user && (singleResult[k].network === 'app' || singleResult[k].network === 'btn'))
                        promiseResult[i][k]['network'] = singleResult[k].user_network;
                    else if(singleResult[k].to && (singleResult[k].network === 'app' || singleResult[k].network === 'btn'))
                        promiseResult[i][k]['network'] = singleResult[k].to_network;
                    else
                        promiseResult[i][k]['network'] = singleResult[k].network;


                    if(promiseResult[i][k]['xrp']) {
                        if(userId)
                            promiseResult[i][k]['xrp']=promiseResult[i][k]['xrp'].toFixed(6);
                        else
                            promiseResult[i][k]['xrp']=promiseResult[i][k]['xrp'].toFixed(2);
                    }
                }   
            }

            return promiseResult;
        } catch(err) {
            console.log(err);
            return [];
        }
    }

    async getChartData(days:number, multiplier: number,
                        getSentTips:boolean,
                        getSentXRP:boolean,
                        getReceivedTips:boolean,
                        getReceivedXRP:boolean,
                        getDepositsCount: boolean,
                        getDepositsXRP: boolean, userId?: string, userName?:string): Promise<any> {
        
        let result:any = {
            sentTips: [],
            sentXRP: [],
            receivedTips: [],
            receivedXRP: [],
            directDepositsCount: [],
            directDepositsXRP: [],
            dateTimes: []
        };

        let userFilter = userId ? "&user_id="+userId : (userName ? "&user="+userName : "")
        let toFilter = userId ? "&to_id="+userId : (userName ? "&to="+userName : "")

        let sentTips:any[] = [];
        let sentXRP:any[] = [];
        let receivedTips:any[] = [];
        let receivedXRP:any[] = [];
        let directDepositsCount:any[] = [];
        let directDepositsXRP:any[] = [];
        let dateTimes:any[] = [];

        let upperDate = new Date();
        let nextLowDate = new Date();
        let lowestDate = new Date();
        //next low day should be last monday if we calculate weeks
        let daysToMonday = nextLowDate.getDay()-1;
        if(multiplier==7) {
            nextLowDate.setDate(nextLowDate.getDate() - daysToMonday);
            lowestDate.setDate(lowestDate.getDate() - daysToMonday);
        }
        
        nextLowDate = this.setZeroTime(nextLowDate);   

        //determine the lowest date to check for
        lowestDate.setDate(lowestDate.getDate() - (days-1)*multiplier);
        lowestDate = this.setZeroTime(lowestDate);

        while(nextLowDate >= lowestDate) {
            if(getSentTips)
                sentTips.push(this.getSentTips(nextLowDate, upperDate, userFilter));
            if(getSentXRP)
                sentXRP.push(this.getSentXRP(nextLowDate, upperDate, userFilter));
            if(getReceivedTips)
                receivedTips.push(this.getReceivedTips(nextLowDate, upperDate, toFilter));
            if(getReceivedXRP)
                receivedXRP.push(this.getReceivedXRP(nextLowDate, upperDate, toFilter));
            if(getDepositsCount)
                directDepositsCount.push(this.getDepositCount(nextLowDate, upperDate, userFilter));
            if(getDepositsXRP)
                directDepositsXRP.push(this.getDepositXRP(nextLowDate, upperDate, userFilter));

            dateTimes.push({from: nextLowDate.toUTCString(), to: upperDate.toUTCString()})

            upperDate = new Date(nextLowDate.toUTCString());
            upperDate.setDate(upperDate.getDate()-1)
            upperDate = this.setHigherTime(upperDate);

            nextLowDate.setDate(nextLowDate.getDate()-multiplier);
            nextLowDate = this.setZeroTime(nextLowDate);
        }

        result.sentTips = await Promise.all(sentTips);
        result.sentXRP = this.roundToSixDecimals(await Promise.all(sentXRP));
        result.receivedTips = await Promise.all(receivedTips);
        result.receivedXRP = this.roundToSixDecimals(await Promise.all(receivedXRP));
        result.directDepositsCount = await Promise.all(directDepositsCount);
        result.directDepositsXRP = this.roundToSixDecimals(await Promise.all(directDepositsXRP));
        result.dateTimes = dateTimes;

        return result;
    }

    async getSentTips(fromDate: Date, toDate:Date, userFilter?: string): Promise<any> {
        return this.api.getCount("type=tip&from_date="+fromDate.toUTCString()+"&to_date="+toDate.toUTCString()+userFilter);
    }

    async getSentXRP(fromDate: Date, toDate:Date, userFilter?: string): Promise<any> {
        return this.api.getAggregatedXRP("type=tip&from_date="+fromDate.toUTCString()+"&to_date="+toDate.toUTCString()+userFilter);
    }

    async getReceivedTips(fromDate: Date, toDate:Date, userFilter?: string): Promise<any> {
        return this.api.getCount("type=tip&from_date="+fromDate.toUTCString()+"&to_date="+toDate.toUTCString()+userFilter);
    }

    async getReceivedXRP(fromDate: Date, toDate:Date, userFilter?: string): Promise<any> {
        return this.api.getAggregatedXRP("type=tip&from_date="+fromDate.toUTCString()+"&to_date="+toDate.toUTCString()+userFilter);
    }

    async getDepositCount(fromDate: Date, toDate:Date, userFilter?: string): Promise<any> {
        return this.api.getCount("type=deposit&from_date="+fromDate.toUTCString()+"&to_date="+toDate.toUTCString()+userFilter);
    }

    async getDepositXRP(fromDate: Date, toDate:Date, userFilter?): Promise<any> {
        return this.api.getAggregatedXRP("type=deposit&from_date="+fromDate.toUTCString()+"&to_date="+toDate.toUTCString()+userFilter);
    }

    private roundToSixDecimals(array:any[]): any[] {
        for(let i = 0; i < array.length;i++)
            array[i] = Number(array[i].toFixed(6));

        return array;
    }

    setZeroMilliseconds(dateToModify: Date): Date {
        dateToModify.setUTCMilliseconds(0);
        return dateToModify
    }

    setHighMilliseconds(dateToModify: Date): Date {
        dateToModify.setUTCMilliseconds(999);
        return dateToModify
    }

    setZeroTime(dateToModify: Date): Date {
        dateToModify.setUTCHours(0);
        dateToModify.setUTCMinutes(0);
        dateToModify.setUTCSeconds(0);
        dateToModify = this.setZeroMilliseconds(dateToModify);

        return dateToModify;
    }
    
    setHigherTime(dateToModify: Date): Date {
        dateToModify.setUTCHours(23);
        dateToModify.setUTCMinutes(59);
        dateToModify.setUTCSeconds(59);
        dateToModify = this.setHighMilliseconds(dateToModify);

        return dateToModify;
    }
}