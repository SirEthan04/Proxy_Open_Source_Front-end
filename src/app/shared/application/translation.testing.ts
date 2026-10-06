import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import english from '../../../../public/i18n/en.json';
import spanish from '../../../../public/i18n/es.json';

// Keep existing component tests independent of catalog HTTP requests.
export function provideTestTranslations() {
  return provideTranslateService({
    lang: 'en',
    loader: {
      provide: TranslateLoader,
      useValue: {
        getTranslation: (language: string) => of(language === 'es' ? spanish : english),
      },
    },
  });
}
