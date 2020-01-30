import { Component, Output, EventEmitter } from "@angular/core";
import { XummService } from '../services/xumm.service';
import { LocalStorageService } from 'angular-2-local-storage';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
    selector: "xummPaymentRequest",
    templateUrl: "xummPaymentRequest.html"
})
export class XummPaymentComponent {

    directLink:string;
    qrLink:string;

    websocket: WebSocketSubject<any>;
    payloadUUID: string;
    showDialog:boolean = true;
    showError: boolean = false;
    waitingForPayment:boolean = false;
    showQR:boolean = false;
    requestExpired:boolean = false;
    loading:boolean = false;
    paymentReceived:boolean = false;

    @Output()
    userSigned: EventEmitter<any> = new EventEmitter();

    constructor(
        private xummApi: XummService,
        private storage: LocalStorageService,
        private deviceDetector: DeviceDetectorService) {
    }

    async supportViaXumm() {
        this.loading = true;
        let frontendId:string;

        if(this.storage.get("pushAllowed")) {
            frontendId = this.storage.get("frontendUserId")
            console.log("frontendID: " + frontendId);
        }
    
        //setting up xumm payload and waiting for websocket
        let xummPayload:any = {
            options: {
                expire: 5,
                return_url: {}
            },
	        txjson: {
                TransactionType: "Payment",
                Destination: "rNixerUVPwrhxGDt4UooDu6FJ7zuofvjCF",
                Fee: "12"
            }
        }

        if(this.deviceDetector.isDesktop())
            xummPayload.options.return_url.web = "https://xrptipbot-stats.com/ilp-pay?payloadId={id}"
        else
            xummPayload.options.return_url.app = "https://xrptipbot-stats.com/ilp-pay?payloadId={id}"

        if(frontendId && this.storage.get("pushAllowed"))
            xummPayload.frontendId = frontendId;

        console.log("sending xumm payload: " + JSON.stringify(xummPayload));
        let xummResponse = await this.xummApi.submitPayload(xummPayload);
        console.log(JSON.stringify(xummResponse));
        this.payloadUUID = xummResponse.uuid;
        this.directLink = xummResponse.next.always;

        if(!this.deviceDetector.isDesktop() && this.directLink)
            window.location.href = this.directLink;
        else {
            this.qrLink = xummResponse.refs.qr_png;
            this.initSocket(xummResponse.refs.websocket_status);
        }
    }

    initSocket(url:string) {
        // register socket for receiving data:
        console.log("connecting socket to: " + url);
        this.websocket = webSocket(url);
        this.loading = false;
        this.waitingForPayment = true;
        this.websocket.asObservable().subscribe(async message => {
            console.log("message received: " + JSON.stringify(message));
            if(message.payload_uuidv4 && message.payload_uuidv4 === this.payloadUUID) {
                let transactionResult = await this.xummApi.checkPayment(message.payload_uuidv4);
                this.waitingForPayment = false;
                console.log(transactionResult);

                if(transactionResult && transactionResult.success) {
                    this.paymentReceived = true;
                    setTimeout(() => this.handleSuccessfullPayment(), 5000);
                } else {
                    this.showError = true;
                }

                this.websocket.unsubscribe();
            } else if(message.expired || message.expires_in_seconds <= 0) {
                this.showError = true;
                this.waitingForPayment = false;
                this.requestExpired = true;
                this.websocket.unsubscribe();
            }
        });
    }
    
    handleSuccessfullPayment() {
        this.userSigned.emit(true);
        this.showDialog = false;
    }

    QRLoaded() {
        this.showQR = true;
    }

    closed() {
        console.log("close dialog");
        if(this.websocket)
            this.websocket.unsubscribe();
            
        this.showDialog = false;
    }
}