import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { WordGrammarService } from '$lib/server/services/word-grammar-service';
import type { WordGrammarAnalysisRequest, WordGrammarAnalysisResponse } from '$lib/types/lyric';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body: WordGrammarAnalysisRequest = await request.json();
		const { word, language } = body;

		if (!word || !language) {
			return json({
				success: false,
				error: '缺少必要参数: word 和 language'
			}, { status: 400 });
		}

		// 分析单词语法
		const analysis = await WordGrammarService.analyzeWord(word, language);

		return json({
			success: true,
			analysis
		});

	} catch (error) {
		console.error('单词语法分析API错误:', error);
		return json({
			success: false,
			error: '分析失败: ' + (error as Error).message
		}, { status: 500 });
	}
}; 