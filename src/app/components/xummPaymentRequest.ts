import { Component, Output, EventEmitter, OnInit, Inject, Input, OnDestroy } from "@angular/core";
import { XummService } from '../services/xumm.service';
import { LocalStorageService } from 'angular-2-local-storage';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import { DeviceDetectorService } from 'ngx-device-detector';
import { uuid } from 'uuidv4';
import { GenericBackendPostRequest, TransactionValidation } from '../util/types';
import { XummPostPayloadBodyJson, XummPostPayloadResponse } from 'xumm-api';
import { DOCUMENT } from '@angular/common';
import { Observable, Subscription } from 'rxjs';

@Component({
    selector: "xummPaymentRequest",
    templateUrl: "xummPaymentRequest.html"
})
export class XummPaymentComponent implements OnInit, OnDestroy {

    qrLink:string;

    websocket: WebSocketSubject<any>;
    payloadUUID: string;
    showDialog:boolean = true;
    showError: boolean = false;
    waitingForPayloadResolved:boolean = false;
    showQR:boolean = false;
    requestExpired:boolean = false;
    backendNotAvailable:boolean = false;
    loading:boolean = false;
    paymentReceived:boolean = false;
    signInValidated:boolean = false;
    isSignIn:boolean = false;
    waitingForCoil:boolean = false;
    isInit:boolean = true;

    @Input()
    userHasPaid: Observable<any>;

    private userHasPaidSubscription: Subscription;
    
    @Output()
    userSigned: EventEmitter<any> = new EventEmitter();

    constructor(
        private xummApi: XummService,
        public storage: LocalStorageService,
        private deviceDetector: DeviceDetectorService,
        @Inject(DOCUMENT) private document: Document) {
    }

    ngOnInit() {
        this.userHasPaidSubscription = this.userHasPaid.subscribe(userHasPaid => {
            //console.log("account info changed received: " + JSON.stringify(accountData));
            this.showDialog = userHasPaid;
        });

        this.isInit = true;
        //check if coil extension is installed
        if(this.document['monetization']) {
            console.log("adding event listener")
            this.waitingForCoil = true;
            this.document['monetization'].addEventListener('monetizationprogress', () => {
                this.handleSuccessfullPayment();
            });

            //wait 10 seconds for Coil monetization. If not started, show payment options
            setTimeout(() => {
                this.waitingForCoil = false;
                this.isInit = false;
            }, 10000);
        } else {
            this.isInit = false;
        }
    }

    ngOnDestroy() {
        if(this.userHasPaidSubscription)
            this.userHasPaidSubscription.unsubscribe();
    }

    async signinToValidate() {
        this.loading = true;
        this.isSignIn = true;
        //setting up xumm payload and waiting for websocket
        let genericXummBackendRequest:GenericBackendPostRequest = {
            options: {
                pushDisabled: !this.storage.get("pushAllowed"),
                signinToValidate: true,
                web: this.deviceDetector.isDesktop(),
            },
            payload: null
        }
        let xummSignInPayload:XummPostPayloadBodyJson = {
            options: {
                expire: 1
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

        genericXummBackendRequest.options.referer = refererURL;

        genericXummBackendRequest.payload = xummSignInPayload;

        let xummSignInResponse:XummPostPayloadResponse;
        try {
            console.log("sending singin xumm payload: " + JSON.stringify(genericXummBackendRequest));
            xummSignInResponse = await this.xummApi.submitPayload(genericXummBackendRequest);
            console.log(JSON.stringify(xummSignInResponse));

            if(!this.deviceDetector.isDesktop() && xummSignInResponse.next.always) {
                console.log("redirect user");
                window.location.href = xummSignInResponse.next.always;
            } else {
                console.log("wait for validation");
                this.payloadUUID = xummSignInResponse.uuid;
                this.qrLink = xummSignInResponse.refs.qr_png;
                this.initSocket(xummSignInResponse.refs.websocket_status, refererURL, true);
            }
        } catch (err) {
            console.log(JSON.stringify(err));
            this.loading = false;
            this.backendNotAvailable = true;
            this.showError = true;
            return;
        }
    }

    async supportViaXumm() {
        this.loading = true;
        this.isSignIn = false;
        let frontendId:string = this.storage.get("frontendUserId");
        if(!(frontendId= this.storage.get("frontendUserId"))) {
            console.log("genreate new frontendID");
            frontendId = uuid();
            console.log("frontendID: " + frontendId);
            this.storage.set("frontendUserId", frontendId);
        }

        //setting up xumm payload and waiting for websocket
        let xummPayload:XummPostPayloadBodyJson = {
            options: {
                expire: 5
            },
	        txjson: {
                TransactionType: "Payment",
                Fee: "12"
            }
        }
    
        let genericXummBackendRequest:GenericBackendPostRequest = {
            options: {
                frontendId: frontendId,
                pushDisabled: !this.storage.get("pushAllowed"),
                web: this.deviceDetector.isDesktop(),
            },
            payload: xummPayload
        }
        
        let refererURL:string;

        if(document.URL.includes('?')) {
            refererURL = document.URL.substring(0, document.URL.indexOf('?'));
        }

        genericXummBackendRequest.options.referer = (refererURL ? refererURL : document.URL);

        let xummResponse:XummPostPayloadResponse;
        try {
            console.log("sending xumm payload: " + JSON.stringify(genericXummBackendRequest));
            xummResponse = await this.xummApi.submitPayload(genericXummBackendRequest);
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
            this.initSocket(xummResponse.refs.websocket_status, refererURL);
        }
    }

    initSocket(url:string, referer: string, isSignIn?: boolean) {
        // register socket for receiving data:
        console.log("connecting socket to: " + url);
        this.websocket = webSocket(url);
        this.loading = false;
        this.waitingForPayloadResolved = true;
        let userOpenedPayload:boolean = false;
        this.websocket.asObservable().subscribe(async message => {
            console.log("message received: " + JSON.stringify(message));
            //user opened payload. Do not expire it!
            if(message.opened)
                userOpenedPayload = message.opened

            //user signed payload. Handle it!
            if(message.payload_uuidv4 && message.payload_uuidv4 === this.payloadUUID) {
                if(!isSignIn) {
                    let transactionResult:TransactionValidation = await this.xummApi.checkPayment(message.payload_uuidv4);
                    console.log(transactionResult);
                    this.waitingForPayloadResolved = false;

                    if(transactionResult && transactionResult.success && !transactionResult.testnet) {
                        this.paymentReceived = true;
                        
                        if(this.storage.get("storeLastUsedPayment"))
                            this.storage.set("lastValidPayloadId", message.payload_uuidv4);

                        setTimeout(() => this.handleSuccessfullPayment(), 5000);
                    } else {
                        this.showError = true;
                    }
                } else {
                    console.log("using referer: " + referer);
                    let validateSignInResponse:TransactionValidation = await this.xummApi.signInToValidateTimedPayment(message.payload_uuidv4, referer);
                    console.log("validateSignInResponse: " + JSON.stringify(validateSignInResponse));
                    this.signInValidated = validateSignInResponse && validateSignInResponse.success;
                    if(!this.signInValidated)
                        this.showError = true;
                    else {
                        setTimeout(() => this.handleSuccessfullPayment(), 5000);
                    }

                    this.waitingForPayloadResolved = false;
                }

                this.websocket.unsubscribe();
                this.websocket.complete();
            } else if((message.expired || message.expires_in_seconds <= 0) && !userOpenedPayload) {
                this.showError = true;
                this.waitingForPayloadResolved = false;
                this.requestExpired = true;
                this.websocket.unsubscribe();
                this.websocket.complete();
            } else if(message.opened) {
                this.showQR = false;
                this.qrLink = null;
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
        if(this.websocket) {
            this.websocket.unsubscribe();
            this.websocket.complete();
        }

        if(!this.paymentReceived && !this.signInValidated && !this.requestExpired && this.showQR && this.payloadUUID) {
            console.log("sending delete request")
            this.xummApi.deletePayload(this.payloadUUID);
        }
    }

    resetAndPay() {
        this.qrLink = null;

        this.websocket = null;
        this.payloadUUID = null;
        this.showDialog = true;
        this.showError = false;
        this.waitingForPayloadResolved = false;
        this.showQR = false;
        this.requestExpired = false;
        this.backendNotAvailable = false;
        this.loading = false;
        this.paymentReceived = false;
        this.signInValidated = false;

        this.supportViaXumm();
    }
}