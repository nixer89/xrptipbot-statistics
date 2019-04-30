import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";

@Component({
    selector: "topTipperFullTable",
    templateUrl: "topTipperFullTable.html"
})
export class TopTipperFullTableComponent implements OnInit {

    @Input()
    data:any;

    @Input()
    headlineDialog:string;

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
    }

    onHide() {
        this.closed.emit(null);
    }
}