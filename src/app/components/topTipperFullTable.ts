import { Component, Input, OnInit } from "@angular/core";
import { ApiService } from '../services/api.service';

@Component({
    selector: "topTipperFullTable",
    templateUrl: "topTipperFullTable.html"
})
export class TopTipperFullTableComponent implements OnInit {

    @Input()
    transactionFilter:string;

    data:any[];

    constructor(private api: ApiService) {

    }

    async ngOnInit() {
        console.log("getting transactions");
        this.data = await this.api.callTipBotStandarizedFeedApi(this.transactionFilter.trim());
        console.log("got transactions: " + JSON.stringify(this.data));
    }

    cleanup() {
        this.transactionFilter = null;
        this.data = null;
    }
}