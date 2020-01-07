import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';
@Component({
    selector: 'app-topbar',
    templateUrl: './topbar.html'
})
export class AppTopbarComponent {
    isApiReachable:boolean = true;
    constructor(private api: ApiService) {
        var xrpTipbotScript = document.createElement("script");
        xrpTipbotScript.setAttribute("id", "xrpTipbotScriptTopbar");
        xrpTipbotScript.setAttribute("src", "https://www.xrptipbot.com/static/donate/tipper.js");
        xrpTipbotScript.setAttribute("title", "XRPTipBot Button");
        document.body.appendChild(xrpTipbotScript);

        this.checkApiAvailability();
        setInterval( () => this.checkApiAvailability(), 30000);
    }

    async checkApiAvailability() {
        try {
            await this.api.isApiReachable();
            this.isApiReachable = true;
        } catch(err) {
            this.isApiReachable = false;
        }
    }
}
