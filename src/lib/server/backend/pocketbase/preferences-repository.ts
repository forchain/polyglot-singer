import type { PocketBaseClientBundle } from './client';
import type { PreferencesRepository } from '../types';
import { mapPocketBasePreferencesRecord } from './mappers';

export function createPocketBasePreferencesRepository(bundle: PocketBaseClientBundle): PreferencesRepository {
	const collection = () => bundle.publicClient.collection('user_preferences');

	return {
		async get(userId: string) {
			try {
				const record = await collection().getFirstListItem(`user = "${userId}"`);
				return mapPocketBasePreferencesRecord(record);
			} catch (error: any) {
				if (error?.status === 404) {
					return null;
				}
				throw error;
			}
		},

		async upsert(userId: string, values: Record<string, unknown>) {
			try {
				const record = await collection().getFirstListItem(`user = "${userId}"`);
				await collection().update(record.id, values);
			} catch (error: any) {
				if (error?.status !== 404) {
					throw error;
				}
				await collection().create({ user: userId, ...values });
			}
		}
	};
}
