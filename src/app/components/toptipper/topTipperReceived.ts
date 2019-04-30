import { Component, Input, OnInit} from "@angular/core";
import { GeneralStatisticsService } from '../../services/generalstatistics.service';
import { ApiService } from '../../services/api.service';

@Component({
    selector: "topTipperReceived",
    templateUrl: "topTipperReceived.html"
})
export class TopTipperReceivedComponent implements OnInit {

    @Input()
    headline:string;

    @Input()
    columnName1:string;

    @Input()
    columnName2:string;

    @Input()
    columnField2:string;

    @Input()
    foundUser:any;

    @Input()
    filter:string;

    @Input()
    showAllButton:string;

    @Input()
    loadAll:string;

    topTipperAllReceived:any[];

    constructor(private api: ApiService, private generalStats: GeneralStatisticsService) {}

    async ngOnInit() {
        this.topTipperAllReceived = await this.generalStats.resolveNamesAndChangeNetworkSingle(await this.api.getCountResult("/mostReceivedFrom",this.filter), this.foundUser.id, this.foundUser.name);
    }

    onHide() {
        this.topTipperAllReceived == null;
    }

}