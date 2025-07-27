import { db } from '../database/connection.js';
import { recordings } from '../database/schema.js';
import { eq, and } from 'drizzle-orm';
import type { NewRecording, Recording } from '../database/schema.js';

export class RecordingService {
	/**
	 * 保存录音
	 */
	static async saveRecording(recording: NewRecording): Promise<Recording> {
		const [saved] = await db.insert(recordings).values(recording).returning();
		return saved;
	}

	/**
	 * 获取单词录音
	 */
	static async getWordRecording(
		userId: string,
		lyricId: string,
		word: string
	): Promise<Recording | null> {
		const [recording] = await db
			.select()
			.from(recordings)
			.where(
				and(
					eq(recordings.userId, userId),
					eq(recordings.lyricId, lyricId),
					eq(recordings.word, word)
				)
			)
			.limit(1);
		return recording || null;
	}

	/**
	 * 获取整句录音
	 */
	static async getLineRecording(
		userId: string,
		lyricId: string,
		lineNumber: number
	): Promise<Recording | null> {
		const [recording] = await db
			.select()
			.from(recordings)
			.where(
				and(
					eq(recordings.userId, userId),
					eq(recordings.lyricId, lyricId),
					eq(recordings.lineNumber, lineNumber)
				)
			)
			.limit(1);
		return recording || null;
	}

	/**
	 * 删除录音
	 */
	static async deleteRecording(recordingId: string): Promise<boolean> {
		const [deleted] = await db
			.delete(recordings)
			.where(eq(recordings.id, recordingId))
			.returning();
		return !!deleted;
	}

	/**
	 * 获取歌词的所有录音
	 */
	static async getLyricRecordings(userId: string, lyricId: string): Promise<Recording[]> {
		return await db
			.select()
			.from(recordings)
			.where(
				and(
					eq(recordings.userId, userId),
					eq(recordings.lyricId, lyricId)
				)
			);
	}
} 