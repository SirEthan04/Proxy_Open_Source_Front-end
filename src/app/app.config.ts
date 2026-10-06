import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { LanguageService } from './shared/application/language.service';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { LocalizedPaginatorIntl } from './shared/presentation/components/localized-paginator-intl';
import { registerLocaleData } from '@angular/common';
import spanishLocale from '@angular/common/locales/es';

registerLocaleData(spanishLocale);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    { provide: MatPaginatorIntl, useClass: LocalizedPaginatorIntl },
    provideTranslateService({
      fallbackLang: 'en',
      loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json', failOnError: true }),
    }),
    provideAppInitializer(() => inject(LanguageService).initialize()),
  ],
};
