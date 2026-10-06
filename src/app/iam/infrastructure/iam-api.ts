import { inject, Service } from '@angular/core';
import { map } from 'rxjs';
import { SignInCommand } from '../domain/model/sign-in.command';
import { SignUpCommand } from '../domain/model/sign-up.command';
import { SignInApiEndpoint } from './sign-in-api-endpoint';
import { SignUpApiEndpoint } from './sign-up-api-endpoint';
import { SignInAssembler } from './sign-in-assembler';
import { SignUpAssembler } from './sign-up-assembler';
import { provideHttpClient } from '@angular/common/http';

@Service()
export class IamApi {
  private readonly signInEndpoint = inject(SignInApiEndpoint);
  private readonly signUpEndpoint = inject(SignUpApiEndpoint);

  signIn(command: SignInCommand) {
    return this.signInEndpoint
      .execute(SignInAssembler.toRequest(command))
      .pipe(map((response) => SignInAssembler.toSession(response)));
  }

  signUp(command: SignUpCommand) {
    return this.signUpEndpoint
      .execute(SignUpAssembler.toRequest(command))
      .pipe(map((response) => SignUpAssembler.toEntity(response)));
  }
}
