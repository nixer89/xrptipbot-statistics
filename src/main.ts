import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  // START WORKAROUND ANGULAR CLI BUG https://github.com/angular/angular-cli/issues/13351
  // SEE https://stackoverflow.com/questions/53329924/angular-7-service-worker-not-registered
  .then(() => {
    if ('serviceWorker' in navigator && environment.production) {
      navigator.serviceWorker.register('/ngsw-worker.js');
    }
  })
  // END WORKAROUND
  .catch(err => console.error(err));
