// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: import('$lib/types/user').User;
			session?: import('lucia').Session;
		}
		interface PageData {
			user?: import('$lib/types/user').User;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {}; 