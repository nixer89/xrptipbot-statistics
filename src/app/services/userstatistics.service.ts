import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { GeneralStatisticsService } from './generalstatistics.service';

@Injectable()
export class UserStatisticsService {

    constructor(private api: ApiService, private generalStats: GeneralStatisticsService) {}

    async getUserStats(fromDate: Date, toDate: Date, network:string, userId?:string, userName?:string): Promise<number[]> {
        //console.log("getUserStats")
        try {
            let userFilter = (userId && userId.trim().length>0) ? "user_id="+userId : "user="+userName;
            let toFilter = (userId && userId.trim().length>0) ? "to_id="+userId : "to="+userName;

            let optionalDateFilter = "";
            if(fromDate && toDate) {
                optionalDateFilter+="&from_date="+this.generalStats.setZeroMilliseconds(fromDate).toUTCString();
                optionalDateFilter+="&to_date="+this.generalStats.setHighMilliseconds(toDate).toUTCString();
            }

            let promises:any[] = [];
            //received tips
            promises.push(this.api.getCount(toFilter+"&type=tip&network="+network+optionalDateFilter));
            //received tips XRP
            promises.push(this.api.getAggregatedXRP(toFilter+"&type=tip&network="+network+optionalDateFilter));
            //sent tips
            promises.push(this.api.getCount(userFilter+"&type=tip&network="+network+optionalDateFilter));
            //sent tips XRP
            promises.push(this.api.getAggregatedXRP(userFilter+"&type=tip&network="+network+optionalDateFilter));
            //deposits
            promises.push(this.api.getCount(userFilter+"&type=deposit&network="+network+optionalDateFilter));
            //deposits XRP
            promises.push(this.api.getAggregatedXRP(userFilter+"&type=deposit&network="+network+optionalDateFilter));
            //withdraw
            promises.push(this.api.getCount(userFilter+"&type=withdraw&network="+network+optionalDateFilter));
            //withdraw XRP
            promises.push(this.api.getAggregatedXRP(userFilter+"&type=withdraw&network="+network+optionalDateFilter));

            return Promise.all(promises);
        } catch(err) {
            console.log(err);
            return [];
        }
    }
}
