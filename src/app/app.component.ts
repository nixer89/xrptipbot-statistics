import { Component, OnInit } from '@angular/core';
import{ Router, NavigationEnd } from '@angular/router';
import {LocalStorageService} from 'angular-2-local-storage'

declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    title = 'XRPTipBot Statistics';

    constructor(private localStorage: LocalStorageService, private router: Router) {
      this.router.events.subscribe(event => {
        if(event instanceof NavigationEnd) {
            let path = (event.urlAfterRedirects.includes('?') ? event.urlAfterRedirects.substring(0, event.urlAfterRedirects.indexOf('?')) : event.urlAfterRedirects);
            gtag('config', 'UA-154892282-1', 
                  {
                    'page_title': this.getPageTitle(path),
                    'page_path': path
                  }
                );
         }
      });
    }

    getPageTitle(page_path:string): string {
      let title = "XRPTipBotStats";

      switch(page_path) {
        case'': case '/': title = "XRPTipBot Feed"; break;
        case '/overallstatistics': title = "XRPTipBot OverallStats"; break;
        case '/userstatistics': title = "XRPTipBot User Stats"; break;
        case '/ilp': title = "XRPTipBot ILP Stats"; break;
        case '/info': title = "XRPTipBotStats Info"; break;
        case '/settings': title = "XRPTipBotStats Settings"; break;
        case '/terms': title = "XRPTipBotStats Terms"; break;
        case '/privacy': title = "XRPTipBotStats Privacy"; break;
        default: title = "XRPTipBot Stats"; break;
      }

      return title;
    }

    ngOnInit(){
      var bodyStyles = document.body.style;
      if(this.localStorage && this.localStorage.get("darkMode")) {
          bodyStyles.setProperty('--background-color', '#222222');
          document.getElementById('themeAsset').setAttribute('href','./assets/themes/luna-amber/theme.css');
      }
      else {
          bodyStyles.setProperty('--background-color', '#f7f7f7');
          document.getElementById('themeAsset').setAttribute('href','./assets/themes/nova-light/theme.css');
      }

      // always scroll to the top of the page on route change:
      this.router.events.subscribe(e => e instanceof NavigationEnd ? window.scrollTo(0,0) : null);
    }
}
