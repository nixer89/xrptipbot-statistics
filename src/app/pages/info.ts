import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'info',
  templateUrl: 'info.html'
})

export class InfoComponent implements OnInit {

  constructor(private titleService: Title, private meta: Meta) {}

  ngOnInit() {
    this.titleService.setTitle("XRPTipBotStats Info");
    this.meta.updateTag({name: 'twitter:title', content: 'XRPTipBotStats Info'});
    this.meta.updateTag({name: 'twitter:image', content: 'https://xrptipbot-stats.com/assets/XRPTipBotStats_Wallpaper.png'});
  }
}
