import type { PocketBaseClientBundle } from './client';
import type { AnalysisRepository, CreateAnalysisInput } from '../types';
import {
	buildAccessibleAnalysisFilter,
	buildOwnerFilter,
	buildPublicGalleryFilter,
	mapPocketBaseAnalysisRecord
} from './mappers';

export function createPocketBaseAnalysisRepository(bundle: PocketBaseClientBundle): AnalysisRepository {
	const collection = () => bundle.publicClient.collection('analyzed_lyrics');

	return {
		async create(input: CreateAnalysisInput) {
			const record = await collection().create({
				user: input.userId,
				title: input.title || '',
				artist: input.artist || '',
				lyrics: input.lyrics,
				sourceLanguage: input.sourceLanguage,
				targetLanguage: input.targetLanguage,
				analysisJson: JSON.parse(input.analysisJson),
				voice: input.voice || '',
				isPublic: false
			});

			return record.id;
		},

		async listForUser(userId: string) {
			const records = await collection().getFullList({
				filter: `user = "${userId}"`,
				sort: '-created'
			});
			return records.map(mapPocketBaseAnalysisRecord);
		},

		async getAccessible(id: string, userId?: string | null) {
			try {
				const record = await collection().getFirstListItem(buildAccessibleAnalysisFilter(id, userId));
				return mapPocketBaseAnalysisRecord(record);
			} catch (error: any) {
				if (error?.status === 404) {
					return null;
				}
				throw error;
			}
		},

		async updatePublic(id: string, userId: string, isPublic: boolean) {
			const record = await collection().getFirstListItem(buildOwnerFilter(id, userId));
			await collection().update(record.id, { isPublic });
		},

		async updateVoice(id: string, userId: string, voice: string) {
			try {
				const record = await collection().getFirstListItem(buildOwnerFilter(id, userId));
				await collection().update(record.id, { voice });
				return true;
			} catch (error: any) {
				if (error?.status === 404) {
					return false;
				}
				throw error;
			}
		},

		async listPublic(limit = 100) {
			const records = await collection().getList(1, limit, {
				filter: buildPublicGalleryFilter(),
				sort: 'created'
			});

			return records.items.map((item: any) => {
				const record = mapPocketBaseAnalysisRecord(item);
				return {
					id: record.id,
					title: record.title,
					artist: record.artist,
					userId: record.userId,
					createdAt: record.createdAt,
					lyrics: record.lyrics?.split('\n').slice(0, 2).join(' / ') || ''
				};
			});
		}
	};
}
