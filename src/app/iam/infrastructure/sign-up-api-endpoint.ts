import { inject, Service } from '@angular/core';
import { SignUpRequest } from './sign-up.request';
import { IamMockApi } from './iam-mock-api';

@Service()
export class SignUpApiEndpoint {
  private readonly mockApi = inject(IamMockApi);

  execute(request: SignUpRequest) {
    return this.mockApi.signUp(request);
  }
}
