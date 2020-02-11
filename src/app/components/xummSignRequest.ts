import { Component, Output, EventEmitter } from "@angular/core";
import { XummService } from '../services/xumm.service';
import { LocalStorageService } from 'angular-2-local-storage';
import { uuid } from 'uuidv4';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
    selector: "xummSignRequest",
    templateUrl: "xummSignRequest.html"
})
export class XummSignComponent {

    qrLink:string;

    websocket: WebSocketSubject<any>;
    payloadUUID: string;
    showDialog:boolean = true;
    showError: boolean = false;
    waitingForPayment:boolean = false;
    showQR:boolean = false;
    requestExpired:boolean = false;
    backendNotAvailable:boolean = false;
    loading:boolean = false;
    transactionSigned:boolean = false;

    @Output()
    userSigned: EventEmitter<any> = new EventEmitter();

    constructor(
        private xummApi: XummService,
        private storage: LocalStorageService,
        private deviceDetector: DeviceDetectorService) {
    }

    async supportViaXumm() {
        this.loading = true;
        let frontendId:string = this.storage.get("frontendUserId");
        if(!(frontendId= this.storage.get("frontendUserId"))) {
            console.log("genreate new frontendID");
            frontendId = uuid();
            console.log("frontendID: " + frontendId);
            this.storage.set("frontendUserId", frontendId);
        }


        //setting up xumm payload and waiting for websocket
        let xummPayload:any = {
            frontendId: frontendId,
            pushDisabled: true,
            web: this.deviceDetector.isDesktop(),
            options: {
                expire: 5
            },
	        txjson: {
                TransactionType: "SignIn"
            }
        }

        let refererURL:string;

        if(document.URL.includes('?')) {
            refererURL = document.URL.substring(0, document.URL.indexOf('?'));
        } else {
            refererURL = document.URL;
        }

        xummPayload.referer = refererURL;

        let xummResponse:any;
        try {
            console.log("sending xumm payload: " + JSON.stringify(xummPayload));
            xummResponse = await this.xummApi.submitPayload(xummPayload);
            console.log(JSON.stringify(xummResponse)); 
        } catch (err) {
            console.log(JSON.stringify(err));
            this.loading = false;
            this.backendNotAvailable = true;
            this.showError = true;
            return;
        }

        this.payloadUUID = xummResponse.uuid;

        if(!this.deviceDetector.isDesktop() && xummResponse.next.always)
            window.location.href = xummResponse.next.always;
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
                
                let transactionResult = await this.xummApi.checkSignIn(message.payload_uuidv4);
                console.log(transactionResult);
                this.waitingForPayment = false;
                if(transactionResult && transactionResult.success) {
                    this.transactionSigned = true;
                    setTimeout(() => this.handleSuccessfullSignIn(), 5000);
                } else {
                    this.showError = true;
                    setTimeout(() => this.handleFailedSignIn(), 5000);
                }

                this.websocket.unsubscribe();
            } else if(message.expired || message.expires_in_seconds <= 0) {
                this.showError = true;
                this.waitingForPayment = false;
                this.requestExpired = true;
                this.websocket.unsubscribe();
            } else if(message.opened) {
                this.showQR = false;
                this.qrLink = null;
            }
        });
    }
    
    handleSuccessfullSignIn() {
        this.userSigned.emit(true);
        this.showDialog = false;
    }

    handleFailedSignIn() {
        this.userSigned.emit(false);
        this.showDialog = false;
    }

    QRLoaded() {
        this.showQR = true;
    }

    closeIt() {
        this.showDialog = false;
    }

    closing() {
        console.log("close dialog");
        if(this.websocket)
            this.websocket.unsubscribe();

        if(!this.transactionSigned) {
            this.userSigned.emit(false);

            if(!this.requestExpired) {
                console.log("sending delete request")
                this.xummApi.deletePayload(this.payloadUUID);
            }
        }
    }
}