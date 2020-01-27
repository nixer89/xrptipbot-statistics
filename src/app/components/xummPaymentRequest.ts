import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { AppService } from '../services/app.service';
import { LocalStorageService } from 'angular-2-local-storage';
import * as io from 'socket.io-client';
import { uuid } from 'uuidv4';

@Component({
    selector: "xummPaymentRequest",
    templateUrl: "xummPaymentRequest.html"
})
export class XummPaymentComponent implements OnInit {

    socket: SocketIOClient.Socket;
    payloadUUID: string;

    @Output()
    userSigned: EventEmitter<any> = new EventEmitter();

    constructor(
        private app: AppService,
        private storage: LocalStorageService) {
    }

    async ngOnInit() {

        let frontendId:string;
        if(!this.storage.get("frontendUserId")) {
            frontendId = uuid();
            this.storage.set("frontendUserId", frontendId);
        }


        //setting up xumm payload and waiting for websocket
        let xummPayload:any = {
            frontendId: frontendId,
	        txjson: {
                TransactionType: "Payment",
                Destination: "rsXhbn7Uag4XmT29ooRG4KLVuqtHPMLLPH",
                Fee: "12",
                Amount: "1000000"
            }
        }

        let xummResponse = await this.app.post("http://localhost:4001/payload", xummPayload);
        console.log(JSON.stringify(xummResponse));
        this.payloadUUID = xummResponse.uuid;
        this.initSocket(xummResponse.refs.websocket_status);
    }

    initSocket(url:string) {
        // register socket for receiving data:
        this.socket = io.connect(url);
        this.socket.on('message', message => {
            if(message.payload_uuidv4 && message.payload_uuidv4 === this.payloadUUID) {
                this.userSigned.emit(message.signed);
                this.socket.close();
            }
        });
    }
}