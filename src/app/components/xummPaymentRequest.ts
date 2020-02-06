import { Component, Output, EventEmitter } from "@angular/core";
import { XummService } from '../services/xumm.service';
import { LocalStorageService } from 'angular-2-local-storage';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import { DeviceDetectorService } from 'ngx-device-detector';
import { uuid } from 'uuidv4';

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
    backendNotAvailable:boolean = false;
    loading:boolean = false;
    paymentReceived:boolean = false;
    signedInAndValidated:boolean = false;
    tryingToSignIn:boolean = false;

    @Output()
    userSigned: EventEmitter<any> = new EventEmitter();

    constructor(
        private xummApi: XummService,
        private storage: LocalStorageService,
        private deviceDetector: DeviceDetectorService) {
    }

    async signinToValidate() {
        this.loading = true;
        this.tryingToSignIn = true;

        //setting up xumm payload and waiting for websocket
        let xummSignInPayload:any = {
            pushDisabled: !this.storage.get("pushAllowed"),
            web: this.deviceDetector.isDesktop(),
            options: {
                expire: 1
            },
	        txjson: {
                TransactionType: "SignIn"
            }
        }

        let xummSignInResponse:any;
        let validateSignInResponse:any;
        try {
            console.log("sending singin xumm payload: " + JSON.stringify(xummSignInPayload));
            xummSignInResponse = await this.xummApi.submitPayload(xummSignInPayload);
            console.log(JSON.stringify(xummSignInResponse));
            //inform server about signin request
            if(xummSignInResponse && xummSignInResponse.uuid) {
                this.payloadUUID = xummSignInResponse.uuid;
                this.qrLink = xummSignInResponse.refs.qr_png;
                this.loading = false;
                this.waitingForPayment = true;
                validateSignInResponse = await this.xummApi.signInToValidateTimedPayment(xummSignInResponse.uuid);
                this.waitingForPayment = false;
            }
        } catch (err) {
            console.log(JSON.stringify(err));
            this.loading = false;
            this.tryingToSignIn = false;
            this.backendNotAvailable = true;
            this.showError = true;
            return;
        }

        if(validateSignInResponse && validateSignInResponse.success) {
            this.signedInAndValidated = true;
            this.loading = false;

            setTimeout(() => this.handleSuccessfullPayment(), 5000);
        } else {
            this.showError = true;
        }
    }

    async supportViaXumm() {
        this.loading = true;
        this.tryingToSignIn = false;
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
            pushDisabled: !this.storage.get("pushAllowed"),
            web: this.deviceDetector.isDesktop(),
            options: {
                expire: 5
            },
	        txjson: {
                TransactionType: "Payment",
                Fee: "12"
            }
        }

        if(this.storage.get("xummFixAmount"))
            xummPayload.txjson.Amount="1000"

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
        let userOpenedPayload:boolean = false;
        this.websocket.asObservable().subscribe(async message => {
            console.log("message received: " + JSON.stringify(message));
            //user opened payload. Do not expire it!
            if(message.opened)
                userOpenedPayload = message.opened

            //user signed payload. Handle it!
            if(message.payload_uuidv4 && message.payload_uuidv4 === this.payloadUUID) {
                let transactionResult = await this.xummApi.checkPayment(message.payload_uuidv4);
                this.waitingForPayment = false;
                console.log(transactionResult);

                if(transactionResult && transactionResult.success) {
                    this.paymentReceived = true;
                    
                    if(this.storage.get("storeLastUsedPayment"))
                        this.storage.set("lastValidPayloadId", message.payload_uuidv4);

                    setTimeout(() => this.handleSuccessfullPayment(), 5000);
                } else {
                    this.showError = true;
                }

                this.websocket.unsubscribe();
            } else if((message.expired || message.expires_in_seconds <= 0) && !userOpenedPayload) {
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

    closeIt() {
        this.showDialog = false;
    }

    closing() {
        console.log("close dialog");
        if(this.websocket)
            this.websocket.unsubscribe();

        this.xummApi.deletePayload(this.payloadUUID);
    }

    resetAndPay() {
        this.directLink = null;
        this.qrLink = null;

        this.websocket = null;
        this.payloadUUID = null;
        this.showDialog = true;
        this.showError = false;
        this.waitingForPayment = false;
        this.showQR = false;
        this.requestExpired = false;
        this.backendNotAvailable = false;
        this.loading = false;
        this.paymentReceived = false;
        this.signedInAndValidated = false;
        this.tryingToSignIn = false;

        this.supportViaXumm();
    }
}