import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { GeneralStatisticsService } from './generalstatistics.service';

@Injectable()
export class UserStatisticsService {

    constructor(private api: ApiService, private generalStats: GeneralStatisticsService) {}

    async getUserStats(userId:string, fromDate: Date, toDate: Date): Promise<number[]> {
        let emptyResult:number[];
        //console.log("getUserStats")
        try {
            if(userId && userId.trim().length>0) {
                let optionalDateFilter = "";
                if(fromDate && toDate) {
                    optionalDateFilter+="&from_date="+this.generalStats.setZeroMilliseconds(fromDate).toUTCString();
                    optionalDateFilter+="&to_date="+this.generalStats.setHighMilliseconds(toDate).toUTCString();
                }

                let promises:any[] = [];
                //received tips
                promises.push(this.api.getCount("to_id="+userId+"&type=tip"+optionalDateFilter));
                //received tips XRP
                promises.push(this.api.getAggregatedXRP("to_id="+userId+"&type=tip"+optionalDateFilter));
                //sent tips
                promises.push(this.api.getCount("user_id="+userId+"&type=tip"+optionalDateFilter));
                //sent tips XRP
                promises.push(this.api.getAggregatedXRP("user_id="+userId+"&type=tip"+optionalDateFilter));
                //deposits
                promises.push(this.api.getCount("user_id="+userId+"&type=deposit"+optionalDateFilter));
                //deposits XRP
                promises.push(this.api.getAggregatedXRP("user_id="+userId+"&type=deposit"+optionalDateFilter));
                //withdraw
                promises.push(this.api.getCount("user_id="+userId+"&type=withdraw"+optionalDateFilter));
                //withdraw XRP
                promises.push(this.api.getAggregatedXRP("user_id="+userId+"&type=withdraw"+optionalDateFilter));

                return Promise.all(promises);
            }
        } catch(err) {
            console.log(err);
            return emptyResult;
        }

        return emptyResult;
    }
}
