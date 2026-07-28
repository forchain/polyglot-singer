import type PocketBase from 'pocketbase';
import type { AppUser } from '$lib/types/auth';
import { mapPocketBaseAuthRecord } from './mappers';

export function getPocketBaseUser(client: PocketBase): AppUser | null {
	return mapPocketBaseAuthRecord(client.authStore.record);
}

export async function refreshPocketBaseAuth(client: PocketBase): Promise<AppUser | null> {
	try {
		if (!client.authStore.isValid) {
			client.authStore.clear();
			return null;
		}

		const collection = client.authStore.record?.collectionName || 'users';
		await client.collection(collection).authRefresh();
		return getPocketBaseUser(client);
	} catch {
		client.authStore.clear();
		return null;
	}
}

export async function loginWithPocketBase(client: PocketBase, email: string, password: string) {
	await client.collection('users').authWithPassword(email, password);
	const user = getPocketBaseUser(client);
	if (!user) {
		throw new Error('PocketBase login did not return a user');
	}

	return {
		user,
		cookie: client.authStore.exportToCookie()
	};
}

export async function registerWithPocketBase(client: PocketBase, email: string, password: string) {
	await client.collection('users').create({
		email,
		password,
		passwordConfirm: password,
		username: email
	});

	return loginWithPocketBase(client, email, password);
}

export function clearPocketBaseAuth(client: PocketBase): string {
	client.authStore.clear();
	return client.authStore.exportToCookie();
}
