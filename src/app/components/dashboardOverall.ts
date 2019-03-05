import { Component, OnInit } from "@angular/core";
import { OverallStatisticsService } from '../services/overallstatistics.service';

@Component({
    selector: "dashboardOverall",
    templateUrl: "dashboardOverall.html"
})
export class DashboardOverallComponent implements OnInit {

    topLists:any[];

    constructor(public overallStatistics: OverallStatisticsService) {
        
    }

    async ngOnInit() {
        //this.topLists = await this.overallStatistics.getOverallStatistics();
        //console.log("top lists: " + JSON.stringify(this.topLists));
    }
}
