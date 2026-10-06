import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface IamConfig {
  readonly apiBaseUrl: string;
  readonly signInPath: string;
  readonly signUpPath: string;
  readonly signInRoute: string;
}

// Frontend API contract; requires an external backend implementing authentication.
export const IAM_CONFIG = new InjectionToken<IamConfig>('IAM_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    apiBaseUrl: environment.apiBaseUrl,
    signInPath: '/authentication/sign-in',
    signUpPath: '/authentication/sign-up',
    signInRoute: '/sign-in',
  }),
});

export function iamEndpoint(config: IamConfig, path: string): string {
  return `${config.apiBaseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

export function isIamApiUrl(url: string, config: IamConfig): boolean {
  const base = config.apiBaseUrl.replace(/\/+$/, '');
  return url === base || url.startsWith(`${base}/`) || url.startsWith(`${base}?`);
}
