import { Injectable } from '@angular/core';
import { AppService } from './app.service';

@Injectable()
export class XummService {
    constructor(private app: AppService) {}

    isTestMode = false;
    xummBackendURL = this.isTestMode ? 'http://localhost:4001' : 'https://xumm.xrptipbot-stats.com';

    async submitPayload(payload:any): Promise<any> {
        try {
            return this.app.post(this.xummBackendURL+"/payload", payload);
        } catch(err) {
            console.log(JSON.stringify(err))
            return { error: true }
        }
    }

    async getPayloadInfo(payloadId:string): Promise<any> {
        try {
            return this.app.get(this.xummBackendURL+"/payload/"+payloadId);
        } catch(err) {
            console.log(JSON.stringify(err))
            return { error: true }
        }
    }

    async checkPayment(payloadId:string): Promise<any> {
        try {
            return this.app.get(this.xummBackendURL+"/checkPayment/"+payloadId);
        } catch(err) {
            console.log(JSON.stringify(err))
            return { error: true }
        }
    }

    async checkTimedPayment(payloadId:string): Promise<any> {
        try {
            return this.app.get(this.xummBackendURL+"/checkTimedPayment/"+payloadId);
        } catch(err) {
            console.log(JSON.stringify(err))
            return { error: true }
        }
    }

    async checkSignIn(payloadId:string): Promise<any> {
        try {
            return this.app.get(this.xummBackendURL+"/checkSignIn/"+payloadId);
        } catch(err) {
            console.log(JSON.stringify(err))
            return { error: true }
        }
    }
}