import { inject, Service } from '@angular/core';
import { SignInRequest } from './sign-in.request';
import { IamMockApi } from './iam-mock-api';

@Service()
export class SignInApiEndpoint {
  private readonly mockApi = inject(IamMockApi);

  execute(request: SignInRequest) {
    return this.mockApi.signIn(request);
  }
}
