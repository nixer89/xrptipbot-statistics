import { Component, OnInit } from '@angular/core';
import {ApiService} from '../services/api.service'

@Component({
  selector: 'buttonURLs',
  templateUrl: 'buttonURLs.html'
})

export class ButtonURLsComponent implements OnInit {

  data:string[];

  constructor(private api: ApiService) {
  }

  async ngOnInit() {
    console.time("gettingData");
    let tips:any[] = await this.api.callTipBotStandarizedFeedApi("type=tip&network=btn");
    console.timeEnd("gettingData");
    let buttonURLS:string[] = [];
    console.time("convertingData");
    tips.forEach(tip => {
      if(tip.context) {
        try {
          let tipURL:URL = new URL(tip.context.substring(0,tip.context.indexOf(' ')));
          if(tipURL && tipURL.hostname != 'localhost' && !buttonURLS.includes(tipURL.origin)) {
            buttonURLS.push(tipURL.origin);
          }
        } catch(err) {
          console.log(JSON.stringify(err) + ": " + JSON.stringify(tip.context));
        }
      }
    });
    console.timeEnd("convertingData");

    console.log(buttonURLS.length);

    this.data = buttonURLS;
    console.log(this.data[0]);
  }
}