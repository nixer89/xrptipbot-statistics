import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { XummService } from '../services/xumm.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocalStorageService } from 'angular-2-local-storage';
import { DeviceDetectorService } from 'ngx-device-detector';
import { TransactionValidation } from '../util/types';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';

@Component({
  selector: 'ilpstatistics-pay',
  templateUrl: 'ilpstatistics-pay.html'
})
export class ILPStatisticsPayComponent implements OnInit {

  userHasPaid:boolean;
  isInit:boolean;
  monetizationTimeout:NodeJS.Timeout = null;

  userHasPaidChanged: Subject<boolean> = new Subject<boolean>();

  constructor(
    private xummApi: XummService,
    private route: ActivatedRoute,
    private titleService: Title,
    private meta: Meta,
    private snackBar: MatSnackBar,
    private storage: LocalStorageService,
    @Inject(DOCUMENT) private document: Document) {
      this.isInit = true;
    }

  async ngOnInit() {
    this.titleService.setTitle("XRPTipBot ILP Stats");
    this.meta.updateTag({name: 'twitter:title', content: 'XRPTipBot ILP Stats'});
    this.meta.updateTag({name: 'twitter:image', content: 'https://xrptipbot-stats.com/assets/XRPTipBotStats_ILPStats.png'});

    if(this.document['monetization']) {
      console.log("adding event listener")
      this.document['monetization'].addEventListener('monetizationprogress', () => this.handleMonetization());
    }

    this.route.queryParams.subscribe(async params => {
      this.isInit = true;
      let payloadIdReceived = params.payloadId;

      let refererURL:string;

        if(document.URL.includes('?')) {
            refererURL = document.URL.substring(0, document.URL.indexOf('?'));
        } else {
          refererURL = document.URL;
        }

      if(payloadIdReceived && params.signinToValidate) {
        //this is a sign in, handle differently!
        
        console.log("check signin");
        let isValid:TransactionValidation = await this.xummApi.signInToValidateTimedPayment(payloadIdReceived, refererURL);
        console.log("isValid: " + JSON.stringify(isValid));
        this.userHasPaid = isValid.success;
        this.isInit = false
        if(!this.userHasPaid)
          this.snackBar.open("Sorry, no valid transaction could be found. Please purchase this statistics again!", null, {panelClass: 'snackbar-failed', duration: 3000, horizontalPosition: 'center', verticalPosition: 'top'});

      } else {
        let latestValidPayloadId = await this.getLastValidPayloadId(this.storage.get("lastValidPayloadId"), payloadIdReceived, refererURL);

        console.log("latestValidPayloadId: " + latestValidPayloadId);
        if(latestValidPayloadId) {
          //check if transaction was successfull and redirect user to stats page right away:
            //show snackbar only on new payload
            console.log("calculated latestValidPayloadId: " + latestValidPayloadId);
            console.log("stored lastValidPayloadId: " + this.storage.get("lastValidPayloadId"));
            if(latestValidPayloadId != this.storage.get("lastValidPayloadId"))
              this.snackBar.open("Thank you for your donation!", null, {panelClass: 'snackbar-success', duration: 3000, horizontalPosition: 'center', verticalPosition: 'top'});

            if(this.storage.get("storeLastUsedPayment"))
              this.storage.set("lastValidPayloadId",latestValidPayloadId);

            this.userHasPaid = true;
            this.isInit = false
        } else {
          console.log("payload not valid");
          if(payloadIdReceived && payloadIdReceived != this.storage.get("lastValidPayloadId")) {
            this.snackBar.open("Sorry, your transaction could not be verified. Please try again!", null, {panelClass: 'snackbar-failed', duration: 3000, horizontalPosition: 'center', verticalPosition: 'top'});
            setTimeout(() => this.isInit = false, 3000);
          } else {
            this.storage.remove("lastValidPayloadId");
            this.isInit = false;
          }
        }
      }
    });
  }

  handleMonetization() {
    //reset
    if(this.monetizationTimeout) {
      clearTimeout(this.monetizationTimeout);
    }

    //hide ilp stats when no payment came within the last 15 seconds.
    this.monetizationTimeout = setTimeout(() => {
      console.log("payments have dryed out...");
      this.userHasPaid = false;
      this.userHasPaidChanged.next(false);
    },15000);
  }

  userSigned(event:any) {
    console.log("user has signed the transaction: " + event);
    this.snackBar.open("Thank you for supporting this project through Coil or Xumm!", null, {panelClass: 'snackbar-success', duration: 3000, horizontalPosition: 'center', verticalPosition: 'top'});
    this.userHasPaid = event;
    this.userHasPaidChanged.next(event);
  }

  async getLastValidPayloadId(payloadIdStored: string, payloadIdReceived: string, referer: string): Promise<string> {
    if(payloadIdStored === payloadIdReceived)
      payloadIdReceived = null;

    console.log("payloadIdStored: " + payloadIdStored);
    console.log("payloadIdReceived: " + payloadIdReceived);
    console.log("referer: " + referer);
    let payloadStoredResult:TransactionValidation = (payloadIdStored ? await this.xummApi.checkTimedPayment(payloadIdStored, referer) : null);
    let payloadReceivedResult:TransactionValidation = (payloadIdReceived ? await this.xummApi.checkTimedPayment(payloadIdReceived, referer) : null);

    console.log("payloadStoredResult: " + JSON.stringify(payloadStoredResult));
    console.log("payloadReceivedResult: " + JSON.stringify(payloadReceivedResult));

    if(payloadStoredResult && payloadStoredResult.success && payloadReceivedResult && payloadReceivedResult.success) {
      //calculate latest payload
      let storedPayloadDate:Date = new Date((await this.xummApi.getPayloadInfo(payloadIdStored)).response.resolved_at);
      let receivedPayloadDate:Date = new Date((await this.xummApi.getPayloadInfo(payloadIdReceived)).response.resolved_at);

      console.log("storedPayloadDate: " + JSON.stringify(storedPayloadDate));
      console.log("receivedPayloadDate: " + JSON.stringify(receivedPayloadDate));

      if(storedPayloadDate.getTime() > receivedPayloadDate.getTime())
        return payloadIdStored;
      else
        return payloadIdReceived
      
    } else if(payloadStoredResult && payloadStoredResult.success) {
        return payloadIdStored;
    } else if(payloadReceivedResult && payloadReceivedResult.success) {
        return payloadIdReceived;
    } else {
        return null;
    }
  }
}
