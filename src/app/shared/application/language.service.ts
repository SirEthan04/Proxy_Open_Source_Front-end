import { inject, Service, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

export type AppLanguage = 'es' | 'en';

@Service()
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);
  readonly loading = signal(false);
  readonly error = signal(false);
  readonly currentLanguage = this.translate.currentLang;

  initialize(): Promise<void> {
    const saved = localStorage.getItem('bodego_language');
    return this.changeLanguage(saved === 'en' ? 'en' : 'es');
  }

  async changeLanguage(language: AppLanguage): Promise<void> {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set(false);
    try {
      await firstValueFrom(this.translate.use(language));
      localStorage.setItem('bodego_language', language);
      this.document.documentElement.lang = language;
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
