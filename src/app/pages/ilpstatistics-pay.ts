import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'ilpstatistics-pay',
  templateUrl: 'ilpstatistics-pay.html'
})
export class ILPStatisticsPayComponent implements OnInit {

  userHasPaid:boolean;

  constructor(private titleService: Title, private meta: Meta) {}

  ngOnInit() {
    this.titleService.setTitle("XRPTipBot ILP Stats");
    this.meta.updateTag({name: 'twitter:title', content: 'XRPTipBot ILP Stats'});
    this.meta.updateTag({name: 'twitter:image', content: 'https://xrptipbot-stats.com/assets/XRPTipBotStats_ILPStats.png'});
  }

  userSigned(event:any) {
    console.log("user has signed the transaction: " + event);
    this.userHasPaid = event;
  }
}
