export interface AppUser {
	id: string;
	email?: string;
	username?: string;
	displayName?: string | null;
	createdAt?: string | Date | null;
}
