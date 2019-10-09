import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { ApiService } from './api.service';
import * as formatUtil from '../util/formattingUtil';

@Injectable()
export class GeneralStatisticsService {

    constructor(private api: ApiService, @Inject(LOCALE_ID) public locale: string) {}

    coilAccounts:string[] = ['COIL_SETTLED_ILP_BALANCE', 'COIL_SETTLEMENT_ACCOUNT'];
    bots:string[] = ['1059563470952247296', '1088476019399577602', '1077305457268658177', '1131106826819444736', '1082115799840632832', '1106106412713889792','52249814', '1027600504304619522'];
    charities:string[] = ['9624042', '3443786712', '951179206104403968', '21855719', '970803226470531072', '1080843472129658880'];

    async getTopTipper(fromDate: Date, toDate: Date, limit: number, network: string, excludeBots?: boolean, excludeCharities?: boolean, excludeCoilSettlement?: boolean, userName?: string): Promise<any[]> {
        try {
            let userFilter = userName ? "&user_network="+network+"&user="+userName : "";
            let toFilter = userName ? "&to_network="+network+"&to="+userName : ""
            let optionalDateFilter = this.constructOptionalFilter(fromDate, toDate, excludeBots, excludeCharities, excludeCoilSettlement);
            
            //console.log(optionalDateFilter);
            let promises:any[] = [];
            //received tips
            promises.push(this.api.getCountResult("/mostReceivedFrom","type=tip&limit="+limit+optionalDateFilter+toFilter));
            //sent tips
            promises.push(this.api.getCountResult("/mostSentTo","type=tip&limit="+limit+optionalDateFilter+userFilter));
            //received tips XRP
            promises.push(this.api.getAggregatedResult("/xrp/mostReceivedFrom","type=tip&limit="+limit+optionalDateFilter+toFilter));
            //sent tips XRP
            promises.push(this.api.getAggregatedResult("/xrp/mostSentTo","type=tip&limit="+limit+optionalDateFilter+userFilter));

            promises = await Promise.all(promises);

            for(let i = 0; i < promises.length; i++) {              
                promises[i] = this.changeToCorrectNetworkAndFixedXRP(promises[i], userName);
            }

            //console.log(JSON.stringify(promises));

            promises.push(optionalDateFilter + (userFilter ? userFilter : ""));
            promises.push(optionalDateFilter + (toFilter ? toFilter : ""));

            return promises;
        } catch(err) {
            console.log(err);
            return [];
        }
    }

    changeToCorrectNetworkAndFixedXRP(numbersResult: any[], userName?:string): any[] {
        for(let k = 0; k < numbersResult.length; k++) {
            //merge numbers and users

            numbersResult[k].network = numbersResult[k]['_id'].network;
            numbersResult[k].id = numbersResult[k]['_id'].id;
            numbersResult[k].user = numbersResult[k]['_id'].user;
            delete numbersResult[k]['_id'];
            
            if(numbersResult[k]['xrp']) {
                if(userName)
                    numbersResult[k]['xrp'] = numbersResult[k]['xrp'].toFixed(6);
                else
                    numbersResult[k]['xrp'] = numbersResult[k]['xrp'].toFixed(2);
            } else {
                numbersResult[k]['xrp'] = 0;
            }
        }

        return numbersResult;
    }

    async getChartData(days:number, multiplier: number,
                        getSentTips:boolean,
                        getSentXRP:boolean,
                        getReceivedTips:boolean,
                        getReceivedXRP:boolean,
                        getDepositsCount: boolean,
                        getDepositsXRP: boolean, userName?:string, excludeCoilSettlementChart?:boolean): Promise<any> {
        
        let result:any = {
            sentTips: [],
            sentXRP: [],
            receivedTips: [],
            receivedXRP: [],
            directDepositsCount: [],
            directDepositsXRP: [],
            dateTimes: []
        };

        let userFilter = userName ? "&user="+userName : "";
        let toFilter = userName ? "&to="+userName : "";

        if(excludeCoilSettlementChart) {
            userFilter+="&excludeUser="+JSON.stringify(this.coilAccounts);
            toFilter+="&excludeUser="+JSON.stringify(this.coilAccounts);
        }

        let sentTips:any[] = [];
        let sentXRP:any[] = [];
        let receivedTips:any[] = [];
        let receivedXRP:any[] = [];
        let directDepositsCount:any[] = [];
        let directDepositsXRP:any[] = [];
        let dateTimes:any[] = [];

        let upperDate = this.setHigherTime(new Date(formatUtil.initializeDateAsGMT2(new Date())));;
        let nextLowDate = new Date(formatUtil.initializeDateAsGMT2(new Date()));
        let lowestDate = new Date(formatUtil.initializeDateAsGMT2(new Date()))

        //next low day should be last monday if we calculate weeks
        let daysToMonday = nextLowDate.getDay()-1;
        if(multiplier==7) {
            nextLowDate.setDate(nextLowDate.getDate() - daysToMonday);
            lowestDate.setDate(lowestDate.getDate() - daysToMonday);
        } else if(multiplier==31) {
            nextLowDate.setDate(1);
            lowestDate.setDate(1);
        } else if(multiplier==366) {
            nextLowDate.setDate(1);
            nextLowDate.setMonth(0);
            lowestDate.setDate(1);
            lowestDate.setMonth(0);
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

            dateTimes.push({from: nextLowDate.toString(), to: upperDate.toString()})

            upperDate = new Date(nextLowDate.toString());
            upperDate.setDate(upperDate.getDate()-1)
            upperDate = this.setHigherTime(upperDate);

            
            if(multiplier==31)
                nextLowDate.setMonth(nextLowDate.getMonth()-1)
            else if(multiplier==366)
                nextLowDate.setFullYear(nextLowDate.getFullYear()-1)
            else
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
        return this.api.getCount("type=tip&from_date="+formatUtil.dateToStringEuropeForAPI(fromDate)+"&to_date="+formatUtil.dateToStringEuropeForAPI(toDate)+userFilter);
    }

    async getSentXRP(fromDate: Date, toDate:Date, userFilter?: string): Promise<any> {
        return this.api.getAggregatedXRP("type=tip&from_date="+formatUtil.dateToStringEuropeForAPI(fromDate)+"&to_date="+formatUtil.dateToStringEuropeForAPI(toDate)+userFilter);
    }

    async getReceivedTips(fromDate: Date, toDate:Date, userFilter?: string): Promise<any> {
        return this.api.getCount("type=tip&from_date="+formatUtil.dateToStringEuropeForAPI(fromDate)+"&to_date="+formatUtil.dateToStringEuropeForAPI(toDate)+userFilter);
    }

    async getReceivedXRP(fromDate: Date, toDate:Date, userFilter?: string): Promise<any> {
        return this.api.getAggregatedXRP("type=tip&from_date="+formatUtil.dateToStringEuropeForAPI(fromDate)+"&to_date="+formatUtil.dateToStringEuropeForAPI(toDate)+userFilter);
    }

    async getDepositCount(fromDate: Date, toDate:Date, userFilter?: string): Promise<any> {
        return this.api.getCount("type=deposit&from_date="+formatUtil.dateToStringEuropeForAPI(fromDate)+"&to_date="+formatUtil.dateToStringEuropeForAPI(toDate)+userFilter);
    }

    async getDepositXRP(fromDate: Date, toDate:Date, userFilter?): Promise<any> {
        return this.api.getAggregatedXRP("type=deposit&from_date="+formatUtil.dateToStringEuropeForAPI(fromDate)+"&to_date="+formatUtil.dateToStringEuropeForAPI(toDate)+userFilter);
    }

    private roundToSixDecimals(array:any[]): any[] {
        for(let i = 0; i < array.length;i++)
            array[i] = Number(array[i].toFixed(6));

        return array;
    }

    setZeroMilliseconds(dateToModify: Date): Date {
        dateToModify.setMilliseconds(0);
        return dateToModify
    }

    setHighMilliseconds(dateToModify: Date): Date {
        dateToModify.setMilliseconds(999);
        return dateToModify
    }

    setZeroTime(dateToModify: Date): Date {
        dateToModify.setHours(0);
        dateToModify.setMinutes(0);
        dateToModify.setSeconds(0);
        dateToModify = this.setZeroMilliseconds(dateToModify);

        return dateToModify;
    }
    
    setHigherTime(dateToModify: Date): Date {
        dateToModify.setHours(23);
        dateToModify.setMinutes(59);
        dateToModify.setSeconds(59);
        dateToModify = this.setHighMilliseconds(dateToModify);

        return dateToModify;
    }

    constructOptionalFilter(fromDate: Date, toDate: Date, excludeBots?: boolean, excludeCharities?: boolean, excludeCoilSettlement?: boolean) {
        let optionalDateFilter = "";
        if(fromDate && toDate) {
            
            optionalDateFilter+="&from_date="+formatUtil.dateToStringEuropeForAPI(this.setZeroMilliseconds(fromDate));
            optionalDateFilter+="&to_date="+formatUtil.dateToStringEuropeForAPI(this.setHighMilliseconds(toDate));
        }

        if(excludeBots || excludeCharities || excludeCoilSettlement) {
            //console.log("exclude some accounts");
            let excludedAccount:any[] = [];
            optionalDateFilter+="&excludeUser=";

            if(excludeBots)
                excludedAccount = excludedAccount.concat(this.bots);

            if(excludeCharities)
                excludedAccount = excludedAccount.concat(this.charities);

            if(excludeCoilSettlement)
                excludedAccount = excludedAccount.concat(this.coilAccounts);
            
            optionalDateFilter+=JSON.stringify(excludedAccount);

            //console.log("excludedAccount: " + JSON.stringify(excludedAccount));

            console.log("filter: " + optionalDateFilter);
        }

        return optionalDateFilter;
    }
}