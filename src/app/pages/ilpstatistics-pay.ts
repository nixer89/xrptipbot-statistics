import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { XummService } from '../services/xumm.service';

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
    private meta: Meta) {
      this.isInit = true;
    }

  async ngOnInit() {

    this.isInit = true;
    this.route.queryParams.subscribe(async params => {
      let payloadId = params.payloadId;
      if(payloadId) {
        //check if transaction was successfull and redirect user to stats page right away:
        let transactionResult = await this.xummApi.checkTimedPayment(payloadId);
        console.log(transactionResult);
        if(transactionResult && transactionResult.success)
          this.userHasPaid = true;
      }
        
      this.isInit = false;
    });

    this.titleService.setTitle("XRPTipBot ILP Stats");
    this.meta.updateTag({name: 'twitter:title', content: 'XRPTipBot ILP Stats'});
    this.meta.updateTag({name: 'twitter:image', content: 'https://xrptipbot-stats.com/assets/XRPTipBotStats_ILPStats.png'});
  }

  userSigned(event:any) {
    console.log("user has signed the transaction: " + event);
    this.userHasPaid = event;
  }
}
