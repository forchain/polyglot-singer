import { eq } from 'drizzle-orm';
import { db, schema } from '$lib/server/database/connection';
import type { PreferencesRepository } from '../types';
import { mapUserPreferencesRow } from './mappers';

export function createPostgresPreferencesRepository(database: any = db): PreferencesRepository {
	return {
		async get(userId: string) {
			const rows = await database
				.select()
				.from(schema.userPreferences)
				.where(eq(schema.userPreferences.userId, userId))
				.limit(1);

			return rows[0] ? mapUserPreferencesRow(rows[0]) : null;
		},

		async upsert(userId: string, values: Record<string, unknown>) {
			const rows = await database
				.select()
				.from(schema.userPreferences)
				.where(eq(schema.userPreferences.userId, userId))
				.limit(1);

			if (rows[0]) {
				await database.update(schema.userPreferences).set(values).where(eq(schema.userPreferences.userId, userId));
				return;
			}

			await database.insert(schema.userPreferences).values({ userId, ...values });
		}
	};
}
