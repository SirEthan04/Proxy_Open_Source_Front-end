export const environment = {
  production: false,
  // Angular serves the simulation JSON on localhost:4200 under this prefix.
  apiBaseUrl: '/api/v1',
  mockDbUrl: '/api/v1/db.json',
} as const;
