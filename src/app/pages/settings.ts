import { Component, OnInit } from "@angular/core";
import { LocalStorageService } from 'angular-2-local-storage';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import{ GoogleAnalyticsService } from '../services/google-analytics.service';
import { XummService } from '../services/xumm.service';
import { uuid } from 'uuidv4';
import { TransactionValidation } from '../util/types';

@Component({
    selector: "settings",
    templateUrl: "settings.html"
})
export class SettingsDialogComponent implements OnInit {

    excludeBots: boolean;
    excludeCharities: boolean;
    excludeCoil: boolean;
    darkMode: boolean;
    pushAllowed: boolean;
    storeLastUsedPayment: boolean;
    xummFixAmount: boolean;
    openSignRequest:boolean = false;


    constructor(private localStorage: LocalStorageService,
                private titleService: Title,
                private meta: Meta,
                private route: ActivatedRoute,
                private googleAnalytics: GoogleAnalyticsService,
                private xummApi: XummService,
                private snackBar: MatSnackBar) {}

    ngOnInit(){
        this.titleService.setTitle("XRPTipBotStats Settings");
        this.meta.updateTag({name: 'twitter:title', content: 'XRPTipBotStats Settings'});
        this.meta.updateTag({name: 'twitter:image', content: 'https://xrptipbot-stats.com/assets/XRPTipBotStats_Wallpaper.png'});
        //load data from storage
        this.excludeBots = this.localStorage.get("excludeBots") || false;
        this.excludeCharities = this.localStorage.get("excludeCharities") || false;
        this.excludeCoil = this.localStorage.get("excludeCoil") || false;
        this.darkMode = this.localStorage.get("darkMode") === null || this.localStorage.get("darkMode") === true;
        this.pushAllowed = this.localStorage.get("pushAllowed") || false;
        this.storeLastUsedPayment = this.localStorage.get("storeLastUsedPayment") || false;
        this.xummFixAmount = this.localStorage.get("xummFixAmount") || false;

        this.route.queryParams.subscribe(async params => {
            let payloadId = params.payloadId;
            if(payloadId) {
              //check if transaction was successfull and redirect user to stats page right away:
              let transactionResult:TransactionValidation = await this.xummApi.checkSignIn(payloadId);
              console.log(transactionResult);
              if(transactionResult) {
                if(transactionResult.success) {
                    this.snackBar.open("XUMM push notifications enabled!", null, {panelClass: 'snackbar-success', duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'});
                } else {
                    this.snackBar.open("Transaction not verified and push disabled. Please try again!", null, {panelClass: 'snackbar-failed', duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'});
                }

                this.userSigned(transactionResult.success)
              }
                
            }
        });
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

    tooglePushAllowed(e:any) {
        if(e.checked) {
            //ask user to sign transaction
            this.openSignRequest = true;
        } else {
            this.localStorage.set("pushAllowed", e.checked);
            this.openSignRequest = false;
        }
        this.googleAnalytics.analyticsEventEmitter("tooglePushAllowed", "settings", "settings_tooglePushAllowed");
    }

    toogleStoreLastUsedPayment(e:any) {
        this.localStorage.set("storeLastUsedPayment", e.checked);
        if(!e.checked) {
            //delete last used payment
            this.localStorage.remove("lastValidPayloadId");
        }

        this.googleAnalytics.analyticsEventEmitter("toogleStoreLastUsedPayment", "settings", "settings_toogleStoreLastUsedPayment");
    }

    toogleXummFixAmount(e:any) {
        this.localStorage.set("xummFixAmount", e.checked);
        this.googleAnalytics.analyticsEventEmitter("toogleXummFixAmount", "settings", "settings_toogleXummFixAmount");
    }

    userSigned(event:any) {
        console.log("user has signed the transaction: " + event);
        this.pushAllowed = event;
        this.localStorage.set("pushAllowed", this.pushAllowed);
        if(this.pushAllowed && !this.localStorage.get("frontendUserId")) {
            this.localStorage.set("frontendUserId", uuid());
        }
        this.openSignRequest = false;
    }
}