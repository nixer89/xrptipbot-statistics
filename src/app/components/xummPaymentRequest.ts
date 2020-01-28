import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { AppService } from '../services/app.service';
import { LocalStorageService } from 'angular-2-local-storage';
import { uuid } from 'uuidv4';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';

@Component({
    selector: "xummPaymentRequest",
    templateUrl: "xummPaymentRequest.html"
})
export class XummPaymentComponent implements OnInit {

    websocket: WebSocketSubject<any>;
    payloadUUID: string;
    showDialog:boolean = true;
    showError: boolean = false;
    waitingForPayment:boolean = false;
    qrLink:string;
    requestExpired:boolean = false;

    @Output()
    userSigned: EventEmitter<any> = new EventEmitter();

    constructor(
        private app: AppService,
        private storage: LocalStorageService) {
    }

    async ngOnInit() {
    }

    async supportViaXumm() {
        this.waitingForPayment = true;
        let frontendId:string;
        if(!(frontendId= this.storage.get("frontendUserId"))) {
            console.log("genreate new frontendID");
            frontendId = uuid();
            console.log("frontendID: " + frontendId);
            this.storage.set("frontendUserId", frontendId);
        }


        //setting up xumm payload and waiting for websocket
        let xummPayload:any = {
            frontendId: frontendId,
            options: {
                expire: 1
            },
	        txjson: {
                TransactionType: "Payment",
                Destination: "rNixerUVPwrhxGDt4UooDu6FJ7zuofvjCF",
                Fee: "12",
            }
        }

        let xummResponse = await this.app.post("https://xumm.xrptipbot-stats.com/payload", xummPayload);
        console.log(JSON.stringify(xummResponse));
        this.payloadUUID = xummResponse.uuid;
        this.qrLink = xummResponse.refs.qr_png;
        this.initSocket(xummResponse.refs.websocket_status);
    }

    initSocket(url:string) {
        // register socket for receiving data:
        console.log("connecting socket to: " + url);
        this.websocket = webSocket(url);
        this.websocket.asObservable().subscribe(async message => {
            console.log("message received: " + JSON.stringify(message));
            if(message.payload_uuidv4 && message.payload_uuidv4 === this.payloadUUID) {
                let transactionResult = await this.app.get("https://xumm.xrptipbot-stats.com/payload/"+message.payload_uuidv4);
                this.waitingForPayment = false;
                console.log(transactionResult);
                if(transactionResult.meta.exists && transactionResult.meta.submit && transactionResult.meta.finished
                    && transactionResult.payload.tx_destination === 'rNixerUVPwrhxGDt4UooDu6FJ7zuofvjCF' && transactionResult.response.dispatched_result === 'tesSUCCESS') {
                        this.userSigned.emit(message.signed);
                        this.showDialog = false;
                } else {

                    this.showError = true;
                }
                this.websocket.unsubscribe();
            } else if(message.expires_in_seconds <= 0) {
                this.showError = true;
                this.waitingForPayment = false;
                this.requestExpired = true;
                this.websocket.unsubscribe();
            }
        });
    }

    closed() {
        console.log("close dialog");
        this.showDialog = false;
    }
}