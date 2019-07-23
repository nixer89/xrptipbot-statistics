import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
    selector: "transactionTableDialog",
    templateUrl: "transactionTableDialog.html"
})
export class TransactionTableDialogComponent {

    @Input()
    transactionFilter:string;

    @Input()
    useInterval:string;

    @Output()
    closed: EventEmitter<any> = new EventEmitter();

    cleanup() {
        this.transactionFilter = null;
        this.useInterval = null;
        this.closed.emit(null);
    }
}