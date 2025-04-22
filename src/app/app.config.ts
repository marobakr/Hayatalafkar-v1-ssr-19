import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from "@angular/core";
import { provideRouter, withHashLocation, withInMemoryScrolling, withViewTransitions } from "@angular/router";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideClientHydration, withEventReplay } from "@angular/platform-browser";

import { routes } from "./app.routes";
import { provideHttpClient, withFetch } from "@angular/common/http";
import { TranslateModule } from "@ngx-translate/core";
import { provideTranslation } from "./core/i18n/i18n.config";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: "top" }),
      withViewTransitions(),
      withHashLocation()
    ),
    provideClientHydration(withEventReplay()),
    provideAnimations(),
    provideHttpClient(withFetch()),
    importProvidersFrom(TranslateModule.forRoot(provideTranslation())),
  ],
};
