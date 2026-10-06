import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { User } from '../domain/model/user.entity';
import { SignInCommand } from '../domain/model/sign-in.command';

import { SignInResponse } from './sign-in-response';
import { SignInAssembler } from './sign-in-assembler';
import { SignInApiEndpoint } from './sign-in-api-endpoint';

@Injectable({
  providedIn: 'root',
})
export class IamApi {
  private readonly http = inject(HttpClient);

  signIn(command: SignInCommand): Observable<User | null> {
    const params = new HttpParams().set('email', command.email).set('password', command.password);

    return this.http.get<SignInResponse[]>(SignInApiEndpoint.url, { params }).pipe(
      map((responses) => {
        if (responses.length === 0) {
          return null;
        }

        return SignInAssembler.toEntity(responses[0]);
      }),
    );
  }
}
