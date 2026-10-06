import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { disabled, form, FormField, pattern, required, submit } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { IamError, IamStore } from '../../../application/iam.store';

const errorMessages: Record<IamError, string> = {
  'invalid-credentials': 'El usuario o la contraseña son incorrectos.',
  'username-taken': 'Este nombre de usuario ya está registrado.',
  network: 'No se pudieron cargar los datos. Inténtalo de nuevo.',
  'invalid-input': 'Completa el usuario y la contraseña.',
  unexpected: 'No se pudo iniciar sesión. Inténtalo de nuevo.',
};

@Component({
  selector: 'app-sign-in-form',
  imports: [FormField, RouterLink],
  templateUrl: './sign-in-form.html',
  styleUrl: './sign-in-form.css',
})
export class SignInForm {
  protected readonly iam = inject(IamStore);
  private readonly injector = inject(Injector);
  private readonly heading = viewChild.required<ElementRef<HTMLHeadingElement>>('heading');
  private readonly usernameInput = viewChild<ElementRef<HTMLInputElement>>('usernameInput');
  private readonly credentials = signal({ username: '', password: '' });
  protected readonly loginForm = form(this.credentials, (fields) => {
    required(fields.username);
    pattern(fields.username, /\S/);
    required(fields.password);
    disabled(fields.username, { when: () => this.iam.loading() });
    disabled(fields.password, { when: () => this.iam.loading() });
  });
  protected readonly errorMessage = computed(() => {
    const error = this.iam.error();
    return error ? errorMessages[error] : null;
  });
  protected readonly roleLabel = computed(() =>
    this.iam.isAdministrator() ? 'Administrador' : 'Empleado',
  );

  protected async signIn(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.loginForm, {
      action: async () => {
        if (await this.iam.signIn(this.credentials())) {
          this.credentials.update((value) => ({ ...value, password: '' }));
          afterNextRender(() => this.heading().nativeElement.focus(), { injector: this.injector });
        }
      },
      onInvalid: () => {
        const field = this.loginForm.username().invalid()
          ? this.loginForm.username
          : this.loginForm.password;
        field().focusBoundControl();
      },
    });
  }

  protected signOut(): void {
    this.iam.signOut();
    this.credentials.set({ username: '', password: '' });
    this.loginForm().reset();
    afterNextRender(() => this.usernameInput()?.nativeElement.focus(), { injector: this.injector });
  }
}
