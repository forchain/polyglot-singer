import type { AppUser } from '$lib/types/auth';
import { mapSupabaseUser } from './mappers';

export function normalizeSupabaseUser(user: unknown): AppUser | null {
	return mapSupabaseUser(user);
}
