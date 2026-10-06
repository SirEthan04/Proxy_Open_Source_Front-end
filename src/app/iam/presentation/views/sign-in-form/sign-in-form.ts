import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSwitcher } from '../../../../shared/presentation/components/language-switcher/language-switcher';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { IamStore } from '../../../application/iam.store';
import { SignInCommand } from '../../../domain/model/sign-in.command';

@Component({
  selector: 'app-sign-in-form',
  imports: [TranslatePipe, LanguageSwitcher,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './sign-in-form.html',
  styleUrl: './sign-in-form.css',
})
export class SignInForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly iamStore = inject(IamStore);
  private readonly router = inject(Router);

  readonly loginError = signal(false);

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],

    password: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.loginError.set(false);

    const value = this.form.getRawValue();

    const command = new SignInCommand(value.email, value.password);

    this.iamStore.signIn(
      command,

      () => {
        this.router.navigate(['/products']);
      },

      () => {
        this.loginError.set(true);
      },
    );
  }
}
