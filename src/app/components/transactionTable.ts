import { Component, Input, OnInit, OnDestroy ,Output, EventEmitter } from "@angular/core";
import { ApiService } from '../services/api.service';
import * as formatUtil from '../util/formattingUtil';

@Component({
    selector: "transactionTable",
    templateUrl: "transactionTable.html"
})
export class TransactionTableComponent implements OnInit, OnDestroy {

    @Input()
    transactionFilter:string;

    @Input()
    rows:string;

    @Input()
    paginator:string;

    @Input()
    useInterval:string;

    @Input()
    enableSort:string;

    @Output()
    closeIt: EventEmitter<any> = new EventEmitter();

    data:any[];
    interval:NodeJS.Timeout;

    constructor(private api: ApiService) {}

    async ngOnInit() {
        //console.log("transactionTable ngOnInit()");
        //console.log("getting transactions");
        this.data = await this.api.callTipBotStandarizedFeedApi(this.transactionFilter.trim());
        //console.log("got data: " + this.data.length);
        if(this.useInterval) {
            this.interval = setInterval(async () => {
                this.data = await this.api.callTipBotStandarizedFeedApi(this.transactionFilter.trim());
            }, 60000);
        }
    }

    ngOnDestroy() {
        clearInterval(this.interval);
        this.transactionFilter = null;
        this.data = null;
    }

    isDiscordOrCoilNetwork(network:string) {
        return 'discord'===network || 'coil' === network;
    }

    getNetworkURLFrom(data:any) {
        return this.getNetworkURL(data.user, data.user_id, data.user_network);
    }

    getNetworkURLTo(data:any) {
        return this.getNetworkURL(data.to, data.to_id, data.to_network);
    }

    getNetworkURL(user:string, user_id:string, network: string): String {
        if(network==='discord') {
            return 'https://discordapp.com/u/'+user_id;
        } else if(network ==='reddit') {
            return 'https://reddit.com/u/'+user;
        } else if(network ==='coil') {
            return 'https://coil.com/u/'+user;
        } else {
            return 'https://twitter.com/'+user;
        }
    }

    resolveIconName(network:any): string {
        if('discord'===network)
            return 'albert';
        else if('reddit'===network)
            return 'berta'
        else if('coil'===network)
            return 'coil'
        else if('twitter'===network)
            return 'emil'
        else return 'emil';
    }

    formatStringDate(date:string) {
        return formatUtil.dateToStringEuropeForLocale(formatUtil.initializeStringDateAsGMT2(date));
    }

    shortenContext(network:string, context: string) {
        if('btn'===network)
            return context.substring(0,context.indexOf(' '));
        else
            return context;
    }

    getIconName(network: string) {
        if('app' === network)
            return 'phonelink_ring';
        else if('btn' === network)
            return 'touch_app';
        else return '';
    }

    close() {
        this.closeIt.emit(null);
    }
}