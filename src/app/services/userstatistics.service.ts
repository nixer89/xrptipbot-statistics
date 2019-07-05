import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { GeneralStatisticsService } from './generalstatistics.service';

@Injectable()
export class UserStatisticsService {

    constructor(private api: ApiService, private generalStats: GeneralStatisticsService) {}

    async getUserStats(fromDate: Date, toDate: Date, network:string, excludeBots?:boolean, excludeCharities?:boolean, excludeCoilSettlement?: boolean, userName?:string): Promise<number[]> {
        //console.log("getUserStats")
        try {
            let userFilter = "user="+userName;
            let toFilter = "to="+userName;

            let optionalDateFilter = this.generalStats.constructOptionalFilter(fromDate, toDate, excludeBots, excludeCharities, excludeCoilSettlement);

            //console.log("userFilter: " + userFilter);
            //console.log("toFilter: " + toFilter);

            let promises:any[] = [];
            //received tips
            promises.push(this.api.getCount(toFilter+"&type=tip&to_network="+network+optionalDateFilter));
            //received tips XRP
            promises.push(this.api.getAggregatedXRP(toFilter+"&type=tip&to_network="+network+optionalDateFilter));
            //sent tips
            promises.push(this.api.getCount(userFilter+"&type=tip&user_network="+network+optionalDateFilter));
            //sent tips XRP
            promises.push(this.api.getAggregatedXRP(userFilter+"&type=tip&user_network="+network+optionalDateFilter));
            //deposits
            promises.push(this.api.getCount(userFilter+"&type=deposit&user_network="+network+optionalDateFilter));
            //deposits XRP
            promises.push(this.api.getAggregatedXRP(userFilter+"&type=deposit&user_network="+network+optionalDateFilter));
            //withdraw
            promises.push(this.api.getCount(userFilter+"&type=withdraw&user_network="+network+optionalDateFilter));
            //withdraw XRP
            promises.push(this.api.getAggregatedXRP(userFilter+"&type=withdraw&user_network="+network+optionalDateFilter));
            //ILP-Deposits XRP
            promises.push(this.api.getILPDepositXRP(userFilter+"&type=ILP deposit&network="+network+optionalDateFilter));

            return Promise.all(promises);
        } catch(err) {
            console.log(err);
            return [];
        }
    }
}
