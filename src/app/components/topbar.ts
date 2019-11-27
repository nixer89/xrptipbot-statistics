import { Component } from '@angular/core';

@Component({
    selector: 'app-topbar',
    templateUrl: './topbar.html'
})
export class AppTopbarComponent {
    constructor() {
        var xrpTipbotScript = document.createElement("script");
        xrpTipbotScript.setAttribute("id", "xrpTipbotScriptTopbar");
        xrpTipbotScript.setAttribute("src", "https://www.xrptipbot.com/static/donate/tipper.js");
        xrpTipbotScript.setAttribute("title", "XRPTipBot Button");
        document.body.appendChild(xrpTipbotScript);
    }
}
