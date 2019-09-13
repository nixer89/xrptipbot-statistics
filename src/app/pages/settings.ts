import { Component, OnInit } from "@angular/core";
import { LocalStorageService } from 'angular-2-local-storage';

@Component({
    selector: "settings",
    templateUrl: "settings.html"
})
export class SettingsDialogComponent implements OnInit {

    excludeBots: boolean;
    excludeCharities: boolean;
    excludeCoil: boolean;

    constructor(private localStorage: LocalStorageService) {

    }

    ngOnInit(){
        //load data from storage
        this.excludeBots = this.localStorage.get("excludeBots") || false;
        this.excludeCharities = this.localStorage.get("excludeCharities") || false;
        this.excludeCoil = this.localStorage.get("excludeCoil") || false;;
    }

    toogleBots(e:any) {
        this.localStorage.set("excludeBots", e.checked);
    }

    toogleCharities(e:any) {
        this.localStorage.set("excludeCharities", e.checked);
    }

    toogleCoil(e:any) {
        this.localStorage.set("excludeCoil", e.checked);
    }
}