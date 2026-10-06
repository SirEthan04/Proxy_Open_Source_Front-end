import { DOCUMENT } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  imports: [TranslatePipe],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
})
export class LanguageSwitcher {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);
  readonly language = this.translate.currentLang;

  constructor() {
    effect(() => {
      const language = this.language();
      if (language === 'en' || language === 'es') {
        this.document.documentElement.lang = language;
        try {
          this.document.defaultView?.localStorage.setItem('bodego_language', language);
        } catch {
          // Language switching remains available when storage is disabled.
        }
      }
    });
  }

  changeLanguage(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLSelectElement && (target.value === 'en' || target.value === 'es')) {
      this.translate.use(target.value);
    }
  }
}
