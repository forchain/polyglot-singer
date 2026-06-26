// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: import('$lib/types/auth').AppUser | null;
			userSyncError?: string;
			pb?: import('pocketbase').default;
		}
		interface PageData {
			user?: import('$lib/types/auth').AppUser | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {}; 
