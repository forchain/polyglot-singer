import { randomUUID } from 'crypto';
import { and, desc, eq } from 'drizzle-orm';
import { db, databaseType, schema } from '$lib/server/database/connection';
import type { AnalysisRepository, CreateAnalysisInput } from '../types';
import { mapAnalyzedLyricRow } from './mappers';

export function createPostgresAnalysisRepository(database: any = db): AnalysisRepository {
	return {
		async create(input: CreateAnalysisInput): Promise<string> {
			const insertData: any = {
				userId: input.userId,
				title: input.title || '',
				artist: input.artist || '',
				lyrics: input.lyrics,
				sourceLanguage: input.sourceLanguage,
				targetLanguage: input.targetLanguage,
				analysisJson: input.analysisJson,
				voice: input.voice || null
			};

			if (databaseType === 'postgres' || databaseType === 'supabase') {
				const inserted = await database
					.insert(schema.analyzedLyrics)
					.values(insertData)
					.returning({ id: schema.analyzedLyrics.id });
				return inserted[0]?.id;
			}

			const id = randomUUID();
			await database.insert(schema.analyzedLyrics).values({ ...insertData, id });
			return id;
		},

		async listForUser(userId: string) {
			const rows = await database
				.select({
					id: schema.analyzedLyrics.id,
					title: schema.analyzedLyrics.title,
					artist: schema.analyzedLyrics.artist,
					createdAt: schema.analyzedLyrics.createdAt,
					isPublic: schema.analyzedLyrics.isPublic
				})
				.from(schema.analyzedLyrics)
				.where(eq(schema.analyzedLyrics.userId, userId))
				.orderBy(desc(schema.analyzedLyrics.createdAt));

			return rows.map(mapAnalyzedLyricRow);
		},

		async getAccessible(id: string, userId?: string | null) {
			const rows = await database
				.select()
				.from(schema.analyzedLyrics)
				.where(eq(schema.analyzedLyrics.id, id))
				.limit(1);
			const record = rows[0] ? mapAnalyzedLyricRow(rows[0]) : null;

			if (!record) {
				return null;
			}

			if (!record.isPublic && (!userId || record.userId !== userId)) {
				return null;
			}

			return record;
		},

		async updatePublic(id: string, userId: string, isPublic: boolean) {
			await database
				.update(schema.analyzedLyrics)
				.set({ isPublic })
				.where(and(eq(schema.analyzedLyrics.id, id), eq(schema.analyzedLyrics.userId, userId)));
		},

		async updateVoice(id: string, userId: string, voice: string) {
			const rows = await database
				.select()
				.from(schema.analyzedLyrics)
				.where(eq(schema.analyzedLyrics.id, id))
				.limit(1);

			if (!rows[0] || rows[0].userId !== userId) {
				return false;
			}

			await database.update(schema.analyzedLyrics).set({ voice } as any).where(eq(schema.analyzedLyrics.id, id));
			return true;
		},

		async listPublic(limit = 100) {
			const rows = await database
				.select({
					id: schema.analyzedLyrics.id,
					title: schema.analyzedLyrics.title,
					artist: schema.analyzedLyrics.artist,
					userId: schema.analyzedLyrics.userId,
					createdAt: schema.analyzedLyrics.createdAt,
					lyrics: schema.analyzedLyrics.lyrics
				})
				.from(schema.analyzedLyrics)
				.where(eq(schema.analyzedLyrics.isPublic, true))
				.orderBy(schema.analyzedLyrics.createdAt)
				.limit(limit);

			return rows.map((item: any) => ({
				...mapAnalyzedLyricRow(item),
				lyrics: item.lyrics?.split('\n').slice(0, 2).join(' / ') || ''
			}));
		}
	};
}
