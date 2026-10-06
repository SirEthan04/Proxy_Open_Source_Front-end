import { provideTranslateService } from '@ngx-translate/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Layout } from './layout';

describe('Layout navigation', () => {
  it('keeps the menu expanded state synchronized when opened and closed', async () => {
    localStorage.removeItem('bodego_user');
    await TestBed.configureTestingModule({
      imports: [Layout],
      providers: [provideTranslateService(), provideRouter([]), provideHttpClient()],
    }).compileComponents();

    const fixture = TestBed.createComponent(Layout);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const toggle = element.querySelector<HTMLButtonElement>('.menu-toggle')!;
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(element.querySelector('.sidebar-open')).not.toBeNull();

    element.querySelector<HTMLButtonElement>('.sidebar-close')!.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(element.querySelector('.sidebar-backdrop')).toBeNull();
  });
});
