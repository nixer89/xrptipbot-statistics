import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable()
export class GeneralStatisticsService {

    constructor(private api: ApiService) {}

    accountsToExclude:string[] = ['COIL_SETTLEMENT_ACCOUNT', 'COIL_SETTLED_ILP_BALANCE', '1069586402898337792']
    bots:string[] = ['1059563470952247296', '1088476019399577602', '1077305457268658177', '1131106826819444736', '1082115799840632832', '1106106412713889792'];
    charities:string[] = ['9624042', '3443786712', '951179206104403968', '21855719', '970803226470531072', '1080843472129658880'];

    getTopTipperFilter(fromDate: Date, toDate: Date, limit?: number, network?:string, userId?:string, userName?:string) {
        let filter = "type=tip";

        if(limit)
            filter+= "&limit="+limit;
            
        let userFilter = userId ? "&user_network="+network+"&user_id="+userId : (userName ? "&user="+userName : "")
        let toFilter = userId ? "&to_network="+network+"&to_id="+userId : (userName ? "&to="+userName : "")
        let optionalDateFilter = "";
        if(fromDate && toDate) {
            optionalDateFilter+="&from_date="+this.setZeroMilliseconds(fromDate).toUTCString();
            optionalDateFilter+="&to_date="+this.setHighMilliseconds(toDate).toUTCString();
        }
        

    }

    async getTopTipper(fromDate: Date, toDate: Date, limit: number, network: string, excludeBots?: boolean, excludeCharities?: boolean, userId?: string, userName?: string): Promise<any[]> {
        try {
            let userFilter = userId ? "&user_network="+network+"&user_id="+userId : (userName ? "&user="+userName : "")
            let toFilter = userId ? "&to_network="+network+"&to_id="+userId : (userName ? "&to="+userName : "")
            let optionalDateFilter = "";
            if(fromDate && toDate) {
                optionalDateFilter+="&from_date="+this.setZeroMilliseconds(fromDate).toUTCString();
                optionalDateFilter+="&to_date="+this.setHighMilliseconds(toDate).toUTCString();
            }
            let promises:any[] = [];
            //received tips
            promises.push(this.api.getCountResult("/mostReceivedFrom","type=tip&limit="+limit+optionalDateFilter+toFilter));
            //sent tips
            promises.push(this.api.getCountResult("/mostSentTo","type=tip&limit="+limit+optionalDateFilter+userFilter));
            //received tips XRP
            promises.push(this.api.getAggregatedResult("/xrp/mostReceivedFrom","type=tip&limit="+limit+optionalDateFilter+toFilter));
            //sent tips XRP
            promises.push(this.api.getAggregatedResult("/xrp/mostSentTo","type=tip&limit="+limit+optionalDateFilter+userFilter));

            let numbersResult = await Promise.all(promises);

            let resolveUserNamesPromiseAll:any[] = [];

            for(let i = 0; i < numbersResult.length; i++) {              
                resolveUserNamesPromiseAll.push(this.resolveNamesAndChangeNetworkSingle(numbersResult[i], excludeBots, excludeCharities, userId, userName));
            }

            let resolveUserNamesPromiseAllResult = await Promise.all(resolveUserNamesPromiseAll);

            resolveUserNamesPromiseAllResult.push(optionalDateFilter + (userFilter ? userFilter : ""));
            resolveUserNamesPromiseAllResult.push(optionalDateFilter + (toFilter ? toFilter : ""));

            return resolveUserNamesPromiseAllResult;
        } catch(err) {
            console.log(err);
            return [];
        }
    }

    async resolveNamesAndChangeNetworkSingle(numberResultList: any[], excludeBots?: boolean, excludeCharities?: boolean, userId?: string, userName?: string): Promise<any[]> {
        numberResultList = numberResultList.filter(user => !this.accountsToExclude.includes(user['_id']));

        if(excludeBots)
            numberResultList = numberResultList.filter(user => !this.bots.includes(user['_id']));
        
        if(excludeCharities)
            numberResultList = numberResultList.filter(user => !this.charities.includes(user['_id']));

        while(numberResultList.length > 10)
            numberResultList.pop();
        
        let resolvedUserNames:any[] = await this.resolveUserNameAndNetwork(numberResultList, userId, userName)
        return this.changeToCorrectNetworkAndFixedXRP(resolvedUserNames, numberResultList, userId);
    }

    async resolveUserNameAndNetwork(resultList:any[], userId: string, userName: string): Promise<any[]> {
        let promises2: any[] = [];

        for(let j = 0; j < resultList.length; j++)
            promises2.push(this.api.getUserNameAndNetwork(resultList[j]['_id'], userId, userName));

        return Promise.all(promises2);
    }

    changeToCorrectNetworkAndFixedXRP(resultList:any[], numbersResult: any[], userId?:string): any[] {
        for(let k = 0; k < resultList.length; k++) {
            //merge numbers and users
            if(numbersResult[k]['xrp'])
                resultList[k]['xrp'] = numbersResult[k]['xrp'];

            if(numbersResult[k]['count'])
                resultList[k]['count'] = numbersResult[k]['count'];

            resultList[k]['_id']= resultList[k].user ? resultList[k].user : resultList[k].to;
            resultList[k]['user_id']= resultList[k].user_id ? resultList[k].user_id : resultList[k].to_id;
            resultList[k]['to_id']= resultList[k].to_id;

            if(resultList[k].user && (resultList[k].network === 'app' || resultList[k].network === 'btn'))
                resultList[k]['network'] = resultList[k].user_network;
            else if(resultList[k].to && (resultList[k].network === 'app' || resultList[k].network === 'btn'))
                resultList[k]['network'] = resultList[k].to_network;
            else
                resultList[k]['network'] = resultList[k].network;


            if(resultList[k]['xrp']) {
                if(userId)
                    resultList[k]['xrp']=resultList[k]['xrp'].toFixed(6);
                else
                    resultList[k]['xrp']=resultList[k]['xrp'].toFixed(2);
            }
        }

        return resultList;
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

        let upperDate = this.setHigherTime(new Date());;
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