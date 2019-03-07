import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { GeneralStatisticsService } from './generalstatistics.service';

@Injectable()
export class OverallStatisticsService {

    constructor(private api: ApiService, private generalStats: GeneralStatisticsService) {}

    async getOverallStats(fromDate: Date, toDate: Date): Promise<number[]> {
        let emptyResult:number[];
        //console.log("getUserStats")
        try {
            let optionalDateFilter = "";
            if(fromDate && toDate) {
                optionalDateFilter+="&from_date="+this.generalStats.setZeroMilliseconds(fromDate).toUTCString();
                optionalDateFilter+="&to_date="+this.generalStats.setHighMilliseconds(toDate).toUTCString();
            }

            let promises:any[] = [];
            //sent tips
            promises.push(this.api.getCount("type=tip"+optionalDateFilter));
            //sent tips XRP
            promises.push(this.api.getAggregatedXRP("type=tip"+optionalDateFilter));
            //deposits
            promises.push(this.api.getCount("type=deposit"+optionalDateFilter));
            //deposits XRP
            promises.push(this.api.getAggregatedXRP("type=deposit"+optionalDateFilter));
            //withdraw
            promises.push(this.api.getCount("type=withdraw"+optionalDateFilter));
            //withdraw XRP
            promises.push(this.api.getAggregatedXRP("type=withdraw"+optionalDateFilter));

            return Promise.all(promises);
        } catch(err) {
            console.log(err);
            return emptyResult;
        }
    }

    async getOverallStatsByNetwork(fromDate: Date, toDate: Date): Promise<number[]> {
        let emptyResult:number[];
        //console.log("getUserStats")
        try {
            let optionalDateFilter = "";
            if(fromDate && toDate) {
                optionalDateFilter+="&from_date="+this.generalStats.setZeroMilliseconds(fromDate).toUTCString();
                optionalDateFilter+="&to_date="+this.generalStats.setHighMilliseconds(toDate).toUTCString();
            }

            let promises:any[] = [];
            //sent tips via twitter
            promises.push(this.api.getCount("type=tip&network=twitter"+optionalDateFilter));
            //sent tips XRP via twitter
            promises.push(this.api.getAggregatedXRP("type=tip&network=twitter"+optionalDateFilter));
            //sent tips via discord
            promises.push(this.api.getCount("type=tip&network=discord"+optionalDateFilter));
            //sent tips via discord
            promises.push(this.api.getAggregatedXRP("type=tip&network=discord"+optionalDateFilter));
            //sent tips via reddit
            promises.push(this.api.getCount("type=tip&network=reddit"+optionalDateFilter));
            //sent tips via reddit
            promises.push(this.api.getAggregatedXRP("type=tip&network=reddit"+optionalDateFilter));
            //sent tips via app
            promises.push(this.api.getCount("type=tip&network=app"+optionalDateFilter));
            //sent tips via app
            promises.push(this.api.getAggregatedXRP("type=tip&network=app"+optionalDateFilter));
            //sent tips via btn
            promises.push(this.api.getCount("type=tip&network=btn"+optionalDateFilter));
            //sent tips via btn
            promises.push(this.api.getAggregatedXRP("type=tip&network=btn"+optionalDateFilter));
            


            return Promise.all(promises);
        } catch(err) {
            console.log(err);
            return emptyResult;
        }
    }
}
