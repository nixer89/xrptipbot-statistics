import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'terms',
  templateUrl: 'terms.html'
})

export class TermsComponent implements OnInit {

  constructor(private titleService: Title, private meta: Meta) {}

  ngOnInit() {
    this.titleService.setTitle("XRPTipBot Terms");
    this.meta.updateTag({name: 'twitter:title', content: 'XRPTipBot Terms'});
    this.meta.updateTag({name: 'twitter:image', content: 'https://xrptipbot-stats.com/assets/XRPTipBotStats_Wallpaper.png'});
  }
}
