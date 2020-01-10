import { Component, Input, OnInit, OnDestroy ,Output, EventEmitter } from "@angular/core";
import { LocalStorageService } from 'angular-2-local-storage';
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

    constructor(private api: ApiService, private localStorage: LocalStorageService) {}

    async loadData() {
        this.data = await this.api.callTipBotStandarizedFeedApi(this.transactionFilter.trim());
    }

    ngOnInit() {
        //console.log("transactionTable ngOnInit()");
        //console.log("getting transactions");
        this.loadData();
        //console.log("got data: " + this.data.length);
        if(this.useInterval) {
            this.interval = setInterval(async () => {
                this.loadData();
            }, 60000);
        }
    }

    ngOnDestroy() {
        clearInterval(this.interval);
        this.transactionFilter = null;
        this.data = null;
    }

    isDiscordOrCoilNetwork(network:string) {
        return 'discord'===network || 'coil' === network || 'internal'=== network;
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
            return 'berta';
        else if('coil'===network) {
            if(this.localStorage.get("darkMode"))
                return 'coil_reversed';
            else
                return 'coil';
        }
        else if('twitter'===network)
            return 'emil';
        else if('internal'===network) {
            if(this.localStorage.get("darkMode"))
                return 'paper_reversed';
            else
                return 'paper';
        }
        else return 'emil';
    }

    formatStringDate(date:string) {
        return formatUtil.dateToStringEuropeForLocale(new Date(date));
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

    getUserNameFrom(tipper:any): string {
        if(tipper.user_network && ( tipper.user_network === 'coil' || tipper.user_network === 'internal'))
            return tipper.user.substring(0,21)+'…';
        else
            return tipper.user;
    }

    getUserNameTo(tipper:any): string {
        if(tipper.to_network && ( tipper.to_network === 'coil' || tipper.to_network === 'internal'))
            return tipper.to.substring(0,21)+'…';
        else
            return tipper.to;
    }

    getEscrowExecutionTime(escrowFinishAfter: string): string {
        try {
            if(escrowFinishAfter && escrowFinishAfter.trim().length>0 && !isNaN(parseInt(escrowFinishAfter))) {
                let escrowDate:Date = new Date(0);
                escrowDate.setSeconds(escrowDate.getSeconds()+946684800)//ripple Epoch in miliseconds
                escrowDate.setSeconds(escrowDate.getSeconds()+parseInt(escrowFinishAfter)); //calculate escrowFinishAfter time
                return "EscrowFinish after: " +escrowDate.toUTCString();
            } else {
                return escrowFinishAfter;
            }
        } catch(err) {
            return (escrowFinishAfter ? escrowFinishAfter : "");
        }
    }

    close() {
        this.closeIt.emit(null);
    }
}