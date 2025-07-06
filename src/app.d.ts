// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: {
				id: string;
				username: string;
				email: string;
				hashedPassword: string;
				display_name: string | null;
				created_at: number | Date;
			} | null;
			session?: import('lucia').Session | null;
		}
		interface PageData {
			user?: {
				id: string;
				username: string;
				email: string;
				hashedPassword: string;
				display_name: string | null;
				created_at: number | Date;
			} | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {}; 