import { Component, Input } from "@angular/core";

@Component({
    selector: "userTable",
    templateUrl: "userTable.html"
})
export class UserTableComponent {

    @Input()
    data:any;

    @Input()
    headline:string;

    @Input()
    columnName1:string;

    @Input()
    columnName2:string;

    @Input()
    columnField2:string;

    getXRPTipBotURL(tipper:any) : string {
        return "https://www.xrptipbot.com/u:"+(tipper['network']==='discord' ? tipper['user_id'] : tipper['_id'])+"/n:"+tipper['network'];
    }

    isDiscordNetwork(network:string) {
        return 'discord'===network;
    }

    getNetworkURL(tipper:any): String {
        if(tipper.network==='discord') {
            return 'https://discordapp.com/u/'+(tipper.user_id ? tipper.user_id:tipper.to_id);
        } else if(tipper.network ==='reddit') {
            return 'https://reddit.com/u/'+tipper._id;
        } else {
            return 'https://twitter.com/'+tipper._id;
        }
    }
}