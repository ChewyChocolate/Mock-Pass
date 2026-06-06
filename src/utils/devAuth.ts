import type { User } from '@supabase/supabase-js';

let cached: User | null = null;

export function setDevAuthUser(user: User | null): void {
  cached = user;
}

export function peekSignedInUser(): User | null {
  return cached;
}
