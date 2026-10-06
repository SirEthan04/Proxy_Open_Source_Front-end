import { Component, inject } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../../application/language.service';

@Component({
  selector: 'app-language-switcher',
  imports: [MatButtonToggleModule, TranslatePipe],
  template: `
    <mat-button-toggle-group
      [value]="language.currentLanguage()"
      [disabled]="language.loading()"
      [attr.aria-label]="'common.language' | translate"
      (change)="onChange($event.value)"
    >
      <mat-button-toggle value="es" aria-label="Español">ES</mat-button-toggle>
      <mat-button-toggle value="en" aria-label="English">EN</mat-button-toggle>
    </mat-button-toggle-group>
    @if (language.error()) {
      <p role="alert">{{ 'common.languageLoadError' | translate }}</p>
    }
  `,
  styles: `
    :host {
      display: block;
      padding: 8px 12px;
    }
    p {
      font-size: 13px;
      color: var(--bodego-error);
    }
  `,
})
export class LanguageSwitcher {
  readonly language = inject(LanguageService);
  onChange(value: unknown): void {
    if (value === 'es' || value === 'en') void this.language.changeLanguage(value);
  }
}
