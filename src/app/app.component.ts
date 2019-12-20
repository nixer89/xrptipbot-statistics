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
            gtag('config', 'UA-154868577-1', 
                  {
                    'page_path': (event.urlAfterRedirects.includes('?') ? event.urlAfterRedirects.substring(0, event.urlAfterRedirects.indexOf('?')) : event.urlAfterRedirects)
                  }
                );
         }
      });
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
    }
}
