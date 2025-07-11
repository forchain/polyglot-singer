// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: import('@supabase/supabase-js').User | null;
			userSyncError?: string;
		}
		interface PageData {
			user?: import('@supabase/supabase-js').User | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {}; 