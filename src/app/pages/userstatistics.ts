import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'userstatistics',
  templateUrl: 'userstatistics.html'
})
export class UserStatisticsComponent implements OnInit {

  constructor(private titleService: Title, private meta: Meta) {}

  ngOnInit() {
    this.titleService.setTitle("XRPTipBot User Stats");
    this.meta.updateTag({name: 'twitter:title', content: 'XRPTipBot User Stats'});
    this.meta.updateTag({name: 'twitter:image', content: 'https://xrptipbot-stats.com/assets/XRPTipBotStats_UserStats.png'});
  }
}
