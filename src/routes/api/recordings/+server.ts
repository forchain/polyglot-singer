import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { RecordingService } from '$lib/server/services/recording-service.js';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const user = locals.user;
		if (!user?.id) {
			return json({ success: false, error: '未登录' }, { status: 401 });
		}

		const { lyricId, word, lineNumber, audioData, audioType, duration } = await request.json();

		if (!lyricId || !audioData) {
			return json({ success: false, error: '缺少必要参数' }, { status: 400 });
		}

		// 检查是否已存在录音
		let existingRecording = null;
		if (word) {
			existingRecording = await RecordingService.getWordRecording(user.id, lyricId, word);
		} else if (lineNumber !== undefined) {
			existingRecording = await RecordingService.getLineRecording(user.id, lyricId, lineNumber);
		}

		let recording;
		if (existingRecording) {
			// 更新现有录音
			// 这里需要先删除再插入，因为drizzle的update不支持复杂的where条件
			await RecordingService.deleteRecording(existingRecording.id);
		}

		// 保存新录音
		recording = await RecordingService.saveRecording({
			userId: user.id,
			lyricId,
			word: word || null,
			lineNumber: lineNumber || null,
			audioData,
			audioType: audioType || 'audio/wav',
			duration: duration || null
		});

		return json({ success: true, recording });
	} catch (error) {
		console.error('保存录音失败:', error);
		
		// 处理外键约束错误
		if (error instanceof Error && error.message.includes('violates foreign key constraint')) {
			return json({ 
				success: false, 
				error: '歌词不存在，请刷新页面后重试' 
			}, { status: 400 });
		}
		
		return json({ success: false, error: '保存录音失败' }, { status: 500 });
	}
};

export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		const user = locals.user;
		if (!user?.id) {
			return json({ success: false, error: '未登录' }, { status: 401 });
		}

		const lyricId = url.searchParams.get('lyricId');
		const word = url.searchParams.get('word');
		const lineNumber = url.searchParams.get('lineNumber');

		if (!lyricId) {
			return json({ success: false, error: '缺少lyricId参数' }, { status: 400 });
		}

		let recording = null;
		if (word) {
			recording = await RecordingService.getWordRecording(user.id, lyricId, word);
		} else if (lineNumber) {
			recording = await RecordingService.getLineRecording(user.id, lyricId, parseInt(lineNumber));
		} else {
			// 获取所有录音
			const recordings = await RecordingService.getLyricRecordings(user.id, lyricId);
			return json({ success: true, recordings });
		}

		return json({ success: true, recording });
	} catch (error) {
		console.error('获取录音失败:', error);
		return json({ success: false, error: '获取录音失败' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
	try {
		const user = locals.user;
		if (!user?.id) {
			return json({ success: false, error: '未登录' }, { status: 401 });
		}

		const { recordingId } = await request.json();

		if (!recordingId) {
			return json({ success: false, error: '缺少recordingId参数' }, { status: 400 });
		}

		const success = await RecordingService.deleteRecording(recordingId);
		return json({ success });
	} catch (error) {
		console.error('删除录音失败:', error);
		return json({ success: false, error: '删除录音失败' }, { status: 500 });
	}
}; 