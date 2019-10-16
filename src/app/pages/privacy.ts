import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'privacy',
  templateUrl: 'privacy.html'
})

export class PrivacyComponent implements OnInit {

  constructor(private titleService: Title, private meta: Meta) {}

  ngOnInit() {
    this.titleService.setTitle("XRPTipBot Privacy");
    this.meta.updateTag({name: 'twitter:title', content: 'XRPTipBot Privacy'});
    this.meta.updateTag({name: 'twitter:image', content: 'https://xrptipbot-stats.com/assets/XRPTipBotStats_Wallpaper.png'});
  }
}
