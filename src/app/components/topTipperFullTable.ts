import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";

@Component({
    selector: "topTipperFullTable",
    templateUrl: "topTipperFullTable.html"
})
export class TopTipperFullTableComponent implements OnInit {

    @Input()
    data:any;

    @Input()
    foundUser:any;

    @Input()
    headline:string;

    @Input()
    columnName1:string;

    @Input()
    columnName2:string;

    @Input()
    columnField2:string;

    @Output()
    closed: EventEmitter<any> = new EventEmitter();

    ngOnInit() {
        //console.log("DialogHeadline: " + JSON.stringify(this.foundUser));
    }

    onHide() {
        //console.log("tipTipperFullTable onHide()");
        this.closed.emit(null);
    }
}