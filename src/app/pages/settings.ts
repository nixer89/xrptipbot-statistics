import { Component, OnInit } from "@angular/core";
import { LocalStorageService } from 'angular-2-local-storage';
import { Title, Meta } from '@angular/platform-browser';
import{ GoogleAnalyticsService } from '../services/google-analytics.service';

@Component({
    selector: "settings",
    templateUrl: "settings.html"
})
export class SettingsDialogComponent implements OnInit {

    excludeBots: boolean;
    excludeCharities: boolean;
    excludeCoil: boolean;
    darkMode: boolean;

    constructor(private localStorage: LocalStorageService,
                private titleService: Title,
                private meta: Meta,
                private googleAnalytics: GoogleAnalyticsService) {}

    ngOnInit(){
        this.titleService.setTitle("XRPTipBotStats Settings");
        this.meta.updateTag({name: 'twitter:title', content: 'XRPTipBotStats Settings'});
        this.meta.updateTag({name: 'twitter:image', content: 'https://xrptipbot-stats.com/assets/XRPTipBotStats_Wallpaper.png'});
        //load data from storage
        this.excludeBots = this.localStorage.get("excludeBots") || false;
        this.excludeCharities = this.localStorage.get("excludeCharities") || false;
        this.excludeCoil = this.localStorage.get("excludeCoil") || false;
        this.darkMode = this.localStorage.get("darkMode") === null || this.localStorage.get("darkMode") === true;
    }

    toogleBots(e:any) {
        this.localStorage.set("excludeBots", e.checked);
        this.googleAnalytics.analyticsEventEmitter("toogleBots", "settings", "settings_toogleBots");
    }

    toogleCharities(e:any) {
        this.localStorage.set("excludeCharities", e.checked);
        this.googleAnalytics.analyticsEventEmitter("toogleCharities", "settings", "settings_toogleCharities");
    }

    toogleCoil(e:any) {
        this.localStorage.set("excludeCoil", e.checked);
        this.googleAnalytics.analyticsEventEmitter("toogleCoil", "settings", "settings_toogleCoil");
    }

    toogleDarkMode(e:any) {
        var bodyStyles = document.body.style;
        if(e.checked) {
            bodyStyles.setProperty('--background-color', '#222222');
            document.getElementById('themeAsset').setAttribute('href','./assets/themes/luna-amber/theme.css');
        }
        else {
            bodyStyles.setProperty('--background-color', '#f7f7f7');
            document.getElementById('themeAsset').setAttribute('href','./assets/themes/nova-light/theme.css');
        }

        this.localStorage.set("darkMode", e.checked);
        this.googleAnalytics.analyticsEventEmitter("toogleDarkMode", "settings", "settings_toogleDarkMode");
    }
}