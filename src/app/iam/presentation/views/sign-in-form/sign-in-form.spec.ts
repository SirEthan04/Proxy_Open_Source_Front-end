import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import axe from 'axe-core';
import { environment } from '../../../../../environments/environment';
import { SignInForm } from './sign-in-form';

describe('Simple login', () => {
  let fixture: ComponentFixture<SignInForm>;
  let http: HttpTestingController;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignInForm],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(SignInForm);
    root = fixture.nativeElement as HTMLElement;
    http = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  function input(id: string, value: string): void {
    const element = root.querySelector<HTMLInputElement>(`#${id}`);
    if (!element) throw new Error(`Missing input ${id}`);
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function send(): void {
    root
      .querySelector('form')
      ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  }

  it('validates empty fields and focuses the first invalid input', async () => {
    send();
    await fixture.whenStable();
    expect(root.textContent).toContain('Ingresa tu usuario.');
    expect(root.textContent).toContain('Ingresa tu contraseña.');
    expect(document.activeElement?.id).toBe('username');
    http.expectNone(environment.mockDbUrl);
  });

  it.each([
    ['administrator', 'Administrador'],
    ['employee', 'Empleado'],
  ])('displays the %s role and supports logout', async (role, label) => {
    input('username', 'demo');
    input('password', 'demo123');
    await fixture.whenStable();
    send();
    http.expectOne(environment.mockDbUrl).flush({
      users: [{ id: 1, username: 'demo', password: 'demo123', role }],
    });
    await fixture.whenStable();
    expect(root.textContent).toContain('Sesión iniciada');
    expect(root.textContent).toContain(`Tipo de usuario: ${label}`);
    expect(document.activeElement?.id).toBe('login-title');
    root.querySelector<HTMLButtonElement>('button')?.click();
    await fixture.whenStable();
    expect(root.querySelector('form')).not.toBeNull();
    expect(root.querySelector<HTMLInputElement>('#password')?.value).toBe('');
    expect(document.activeElement?.id).toBe('username');
  });

  it('announces rejected credentials and allows another attempt', async () => {
    input('username', 'demo');
    input('password', 'wrong');
    await fixture.whenStable();
    send();
    http.expectOne(environment.mockDbUrl).flush({
      users: [{ id: 1, username: 'demo', password: 'demo123', role: 'employee' }],
    });
    await fixture.whenStable();
    expect(root.querySelector('[aria-live]')?.textContent).toContain(
      'El usuario o la contraseña son incorrectos.',
    );
    expect(root.querySelector<HTMLButtonElement>('button')?.disabled).toBe(false);
    input('password', 'demo123');
    await fixture.whenStable();
    send();
    await fixture.whenStable();
    expect(root.textContent).toContain('Sesión iniciada');
  });

  it('passes axe rules for the login and authenticated views', async () => {
    // jsdom does not perform layout; color contrast needs browser/manual verification.
    const options = { rules: { 'color-contrast': { enabled: false } } };
    expect((await axe.run(root, options)).violations).toEqual([]);
    input('username', 'demo');
    input('password', 'demo123');
    await fixture.whenStable();
    send();
    http.expectOne(environment.mockDbUrl).flush({
      users: [{ id: 1, username: 'demo', password: 'demo123', role: 'employee' }],
    });
    await fixture.whenStable();
    expect((await axe.run(root, options)).violations).toEqual([]);
  });
});
