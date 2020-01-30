import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { XummService } from '../services/xumm.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocalStorageService } from 'angular-2-local-storage';

@Component({
  selector: 'ilpstatistics-pay',
  templateUrl: 'ilpstatistics-pay.html'
})
export class ILPStatisticsPayComponent implements OnInit {

  userHasPaid:boolean;
  isInit:boolean;

  constructor(
    private xummApi: XummService,
    private route: ActivatedRoute,
    private titleService: Title,
    private meta: Meta,
    private snackBar: MatSnackBar,
    private storage: LocalStorageService) {
      this.isInit = true;
    }

  async ngOnInit() {
    this.titleService.setTitle("XRPTipBot ILP Stats");
    this.meta.updateTag({name: 'twitter:title', content: 'XRPTipBot ILP Stats'});
    this.meta.updateTag({name: 'twitter:image', content: 'https://xrptipbot-stats.com/assets/XRPTipBotStats_ILPStats.png'});

    //check stored payloadID if it is still valid. If not, remove it!
    if(this.storage.get("lastValidPayloadId")) {
      let isStoredPayloadValid = await this.xummApi.checkTimedPayment(this.storage.get("lastValidPayloadId"));

      if(!isStoredPayloadValid.success)
        this.storage.remove("lastValidPayloadId")
    }

    this.route.queryParams.subscribe(async params => {
      this.isInit = true;
      let payloadIdReceived = params.payloadId;
      let latestValidPayloadId = await this.getLastValidPayloadId(this.storage.get("lastValidPayloadId"), payloadIdReceived);

      console.log("latestValidPayload: " + latestValidPayloadId);
      if(latestValidPayloadId) {
        //check if transaction was successfull and redirect user to stats page right away:
          //show snackbar only on new payload
          if(latestValidPayloadId != this.storage.get("lastValidPayloadId"))
            this.snackBar.open("Thank you for your donation!", null, {panelClass: 'snackbar-success', duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'});

          this.storage.set("lastValidPayloadId",latestValidPayloadId);
          this.userHasPaid = true;
          this.isInit = false
      } else {
        if(payloadIdReceived) {
          this.snackBar.open("Sorry, your transaction could not be verified. Please try again!", null, {panelClass: 'snackbar-failed', duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'});
          setTimeout(() => this.isInit = false, 5000);
        } else {
          this.isInit = false;
        }
      }
    });
  }

  userSigned(event:any) {
    console.log("user has signed the transaction: " + event);
    this.userHasPaid = event;
  }

  async getLastValidPayloadId(payloadIdStored: string, payloadIdReceived: string): Promise<string> {
    console.log("payloadIdStored: " + payloadIdStored);
    console.log("payloadIdReceived: " + payloadIdReceived);
    let payloadStoredResult:any = (payloadIdStored ? await this.xummApi.checkTimedPayment(payloadIdStored) : null);
    let payloadReceivedResult:any = (payloadIdReceived ? await this.xummApi.checkTimedPayment(payloadIdReceived) : null);

    if(payloadStoredResult && payloadStoredResult.success && payloadReceivedResult && payloadReceivedResult.success) {
      //calculate latest payload
      let storedPayloadDate:Date = (await this.xummApi.getPayloadInfo(payloadIdStored)).response.resolved_at;
      let receivedPayloadDate:Date = (await this.xummApi.getPayloadInfo(payloadIdReceived)).response.resolved_at;

      if(storedPayloadDate.getTime() > receivedPayloadDate.getTime())
        return payloadIdStored;
      else
        return payloadReceivedResult
      
    } else if(payloadStoredResult && payloadStoredResult.success) {
        return payloadIdStored
    } else if(payloadReceivedResult && payloadReceivedResult.success) {
        return payloadIdReceived;
    } else {
        return null;
    }
  }
}
