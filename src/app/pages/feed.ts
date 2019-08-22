import { Component } from '@angular/core';

@Component({
  selector: 'feed',
  templateUrl: 'feed.html'
})
export class FeedComponent {

  excludeUsers='';

  constructor() {}

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