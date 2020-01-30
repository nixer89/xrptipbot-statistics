import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { XummService } from '../services/xumm.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private snackBar: MatSnackBar) {
      this.isInit = true;
    }

  async ngOnInit() {
    this.titleService.setTitle("XRPTipBot ILP Stats");
    this.meta.updateTag({name: 'twitter:title', content: 'XRPTipBot ILP Stats'});
    this.meta.updateTag({name: 'twitter:image', content: 'https://xrptipbot-stats.com/assets/XRPTipBotStats_ILPStats.png'});

    this.route.queryParams.subscribe(async params => {
      let payloadId = params.payloadId;
      if(payloadId) {
        this.isInit = true;
        //check if transaction was successfull and redirect user to stats page right away:
        let transactionResult = await this.xummApi.checkTimedPayment(payloadId);
        console.log(transactionResult);
        if(transactionResult && transactionResult.success) {
          this.snackBar.open("Thank you for your donation!", null, {panelClass: 'snackbar-success', duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'});
          this.userHasPaid = true;
          this.isInit = false
        } else {
          this.snackBar.open("Sorry, your transaction could not be verified. Please try again!", null, {panelClass: 'snackbar-failed', duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'});
          setTimeout(() => this.isInit = false, 5000);
        }
      }
    });
  }

  userSigned(event:any) {
    console.log("user has signed the transaction: " + event);
    this.userHasPaid = event;
  }
}
