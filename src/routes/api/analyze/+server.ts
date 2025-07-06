import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { analyzeToLyrics } from '$lib/server/services/ai-service.js';
import { z } from 'zod';
import { db, schema, databaseType } from '$lib/server/database/connection';
import { randomUUID } from 'crypto';

// Request validation schema
const analyzeRequestSchema = z.object({
	lyrics: z.string().min(1, 'Lyrics are required').max(10000, 'Lyrics too long'),
	sourceLanguage: z.string().optional().default('en'),
	targetLanguage: z.string().optional().default('zh'),
	provider: z.string().optional().default('deepseek'),
	title: z.string().optional(),
	artist: z.string().optional(),
	voice: z.string().optional()
});

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		// Parse request body
		const body = await request.json();
		
		// Validate request
		const validatedData = analyzeRequestSchema.parse(body);
		
		// Check if user is authenticated
		const user = locals.user;
		
		// 检查用户是否已登录
		if (!user?.id) {
			return json(
				{
					success: false,
					error: 'Authentication required',
					message: '请先登录后再使用此功能'
				},
				{ status: 401 }
			);
		}
		
		// Analyze lyrics using AI service
		const analysis = await analyzeToLyrics(
			validatedData.lyrics,
			validatedData.sourceLanguage,
			validatedData.targetLanguage,
			validatedData.title,
			validatedData.artist,
			validatedData.provider
		);
		
		// Generate ID based on database type
		const id = (databaseType === 'postgres' || databaseType === 'supabase') 
			? undefined  // PostgreSQL will auto-generate UUID
			: randomUUID(); // PostgreSQL needs explicit ID
		
		// 保存到analyzed_lyrics表
		const insertData: any = {
			userId: user.id,
			title: validatedData.title || '',
			artist: validatedData.artist || '',
			lyrics: validatedData.lyrics,
			sourceLanguage: validatedData.sourceLanguage,
			targetLanguage: validatedData.targetLanguage,
			analysisJson: JSON.stringify(analysis),
			voice: validatedData.voice || null
		};
		
		if (id) {
			insertData.id = id;
		}
		
		await db.insert(schema.analyzedLyrics).values(insertData);
		
		// 查询刚插入的id（Postgres可用RETURNING）
		const inserted = await db.select({ id: schema.analyzedLyrics.id }).from(schema.analyzedLyrics).orderBy(schema.analyzedLyrics.createdAt).limit(1);
		const analysisId = inserted[0]?.id;
		
		// Return successful response
		return json({
			success: true,
			analysis: { ...analysis, id: analysisId },
			metadata: {
				userId: user?.id,
				timestamp: new Date().toISOString()
			}
		});
		
	} catch (error) {
		console.error('Analysis API error:', error);
		
		// Handle validation errors
		if (error instanceof z.ZodError) {
			return json(
				{
					success: false,
					error: 'Invalid request data',
					details: error.errors.map(e => ({
						field: e.path.join('.'),
						message: e.message
					}))
				},
				{ status: 400 }
			);
		}
		
		// Handle other errors
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Analysis failed'
			},
			{ status: 500 }
		);
	}
}; 