import { Component, Input, OnInit } from "@angular/core";
import { ApiService } from '../services/api.service';

@Component({
    selector: "transactionTable",
    templateUrl: "transactionTable.html"
})
export class TransactionTableComponent implements OnInit {

    @Input()
    transactionFilter:string;

    data:any[];

    constructor(private api: ApiService) {

    }

    async ngOnInit() {
        console.log("getting transactions");
        this.data = await this.api.callTipBotStandarizedFeedApi("type=tip"+this.transactionFilter.trim());
        console.log("got transactions: " + JSON.stringify(this.data));
    }

    cleanup() {
        this.transactionFilter = null;
        this.data = null;
    }
}