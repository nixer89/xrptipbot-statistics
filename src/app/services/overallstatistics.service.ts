import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { GeneralStatisticsService } from './generalstatistics.service';

@Injectable()
export class OverallStatisticsService {

    constructor(private api: ApiService, private generalStats: GeneralStatisticsService) {}

    coilAccounts:string[] = ['COIL_SETTLED_ILP_BALANCE', 'COIL_SETTLEMENT_ACCOUNT'];
    bots:string[] = ['1059563470952247296', '1088476019399577602', '1077305457268658177', '1131106826819444736', '1082115799840632832', '1106106412713889792','52249814'];
    charities:string[] = ['9624042', '3443786712', '951179206104403968', '21855719', '970803226470531072', '1080843472129658880'];

    async getOverallStats(fromDate: Date, toDate: Date, excludeBots?:boolean, excludeCharities?:boolean, excludeCoilSettlement?: boolean): Promise<number[]> {
        let emptyResult:number[];
        //console.log("getOverallStats")
        try {
            let optionalDateFilter = this.generalStats.constructOptionalFilter(fromDate, toDate, excludeBots, excludeCharities, excludeCoilSettlement);

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

    async getOverallStatsByNetwork(fromDate: Date, toDate: Date, excludeBots?:boolean, excludeCharities?:boolean, excludeCoilSettlement?: boolean): Promise<number[]> {
        let emptyResult:number[];
        //console.log("getUserStats")
        try {
            let optionalDateFilter = this.generalStats.constructOptionalFilter(fromDate, toDate, excludeBots, excludeCharities, excludeCoilSettlement);

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
