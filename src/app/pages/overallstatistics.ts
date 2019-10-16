import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'overallstatistics',
  templateUrl: 'overallstatistics.html'
})
export class OverallStatisticsComponent {

  constructor(private titleService: Title, private meta: Meta) {}
  
  ngOnInit() {
    this.titleService.setTitle("XRPTipBot OverallStats");
    this.meta.updateTag({name: 'twitter:title', content: 'XRPTipBot OverallStats'});
    this.meta.updateTag({name: 'twitter:image', content: 'https://xrptipbot-stats.com/assets/XRPTipBotStats_OverallStats.png'});
  }
}
