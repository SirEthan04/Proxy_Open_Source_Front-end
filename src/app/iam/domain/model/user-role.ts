export type UserRole = 'administrator' | 'employee';

export function isUserRole(value: unknown): value is UserRole {
  return value === 'administrator' || value === 'employee';
}
