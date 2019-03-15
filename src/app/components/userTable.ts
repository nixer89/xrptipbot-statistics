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

    getShowName(tipper:any) : string {
        if(tipper.network==='discord')
            return tipper.user_id ? tipper.user_id : tipper.to_id;
        else
            return tipper._id;
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