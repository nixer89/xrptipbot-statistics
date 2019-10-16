import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'feed',
  templateUrl: 'feed.html'
})
export class FeedComponent implements OnInit {

  excludeUsers='';

  constructor(private titleService: Title, private meta: Meta) {}

  ngOnInit() {
    this.titleService.setTitle("XRPTipBot Feed");
    this.meta.updateTag({name: 'twitter:title', content: 'XRPTipBot Feed'});
    this.meta.updateTag({name: 'twitter:image', content: 'https://xrptipbot-stats.com/assets/XRPTipBotStats_Feed.png'});
  }

  getExcludeUsers(): String {
    if(this.excludeUsers && this.excludeUsers.length > 0) {
      console.log("having exclude user");
      let users:string[] = this.excludeUsers.split(',');
      let t = "&excludeUser="+JSON.stringify(users);
      console.log(t);
      return t;
    } else
      return "";
  }
}