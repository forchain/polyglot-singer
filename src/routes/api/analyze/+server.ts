import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { analyzeToLyrics } from '$lib/server/services/ai-service.js';
import { z } from 'zod';

// Request validation schema
const analyzeRequestSchema = z.object({
	lyrics: z.string().min(1, 'Lyrics are required').max(10000, 'Lyrics too long'),
	sourceLanguage: z.string().optional().default('en'),
	targetLanguage: z.string().optional().default('zh'),
	provider: z.string().optional().default('openai'),
	title: z.string().optional(),
	artist: z.string().optional()
});

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		// Parse request body
		const body = await request.json();
		
		// Validate request
		const validatedData = analyzeRequestSchema.parse(body);
		
		// Check if user is authenticated (optional for demo)
		const user = locals.user;
		
		// Analyze lyrics using AI service
		const analysis = await analyzeToLyrics(
			validatedData.lyrics,
			validatedData.sourceLanguage,
			validatedData.targetLanguage,
			validatedData.title,
			validatedData.artist,
			validatedData.provider
		);
		
		// Return successful response
		return json({
			success: true,
			analysis,
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