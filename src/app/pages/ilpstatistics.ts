import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'ilpstatistics',
  templateUrl: 'ilpstatistics.html'
})
export class ILPStatisticsComponent implements OnInit {

  constructor(private titleService: Title, private meta: Meta) {}

  ngOnInit() {
    this.titleService.setTitle("XRPTipBot ILP Stats");
    this.meta.updateTag({name: 'twitter:title', content: 'XRPTipBot ILP Stats'});
    this.meta.updateTag({name: 'twitter:image', content: 'https://xrptipbot-stats.com/assets/XRPTipBotStats_ILPStats.png'});
  }
}
