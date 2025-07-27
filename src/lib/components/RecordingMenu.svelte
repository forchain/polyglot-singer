<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { audioCache } from '$lib/utils/audioCache.js';

	export let lyricId: string;
	export let word: string | undefined = undefined;
	export let lineNumber: number | undefined = undefined;
	export let isVisible = false;
	export let position = { x: 0, y: 0 };

	const dispatch = createEventDispatcher();

	let mediaRecorder: MediaRecorder | null = null;
	let audioChunks: Blob[] = [];
	let isRecording = false;
	let hasRecording = false;
	let recordingId: string | null = null;
	let audioElement: HTMLAudioElement;
	let isPlaying = false;
	
	// 缓存键
	let cacheKey: string | null = null;

	// 生成缓存键
	function generateCacheKey(): string {
		return audioCache.generateKey(lyricId, word, lineNumber);
	}

	// 检查是否有录音
	async function checkRecording() {
		try {
			const params = new URLSearchParams({ lyricId });
			if (word) {
				params.append('word', word);
			} else if (lineNumber !== undefined) {
				params.append('lineNumber', lineNumber.toString());
			}

			const response = await fetch(`/api/recordings?${params}`);
			const result = await response.json();
			
			if (result.success && result.recording) {
				hasRecording = true;
				recordingId = result.recording.id;
				cacheKey = generateCacheKey();
			}
		} catch (error) {
			console.error('检查录音失败:', error);
		}
	}

	// 开始录音
	async function startRecording() {
		try {
			// 检查参数
			console.log('开始录音，参数检查:', {
				lyricId,
				word,
				lineNumber,
				isVisible
			});

			if (!lyricId) {
				alert('缺少歌词ID，请刷新页面重试');
				return;
			}

			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			mediaRecorder = new MediaRecorder(stream);
			audioChunks = [];

			mediaRecorder.ondataavailable = (event) => {
				audioChunks.push(event.data);
			};

			mediaRecorder.onstop = async () => {
				const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
				console.log('录音完成，音频大小:', audioBlob.size);
				await saveRecording(audioBlob);
				stream.getTracks().forEach(track => track.stop());
			};

			mediaRecorder.start();
			isRecording = true;
		} catch (error) {
			console.error('录音失败:', error);
			alert('无法访问麦克风，请检查权限设置');
		}
	}

	// 停止录音
	function stopRecording() {
		if (mediaRecorder && isRecording) {
			mediaRecorder.stop();
			isRecording = false;
		}
	}

	// 保存录音
	async function saveRecording(audioBlob: Blob) {
		try {
			const reader = new FileReader();
			reader.onload = async () => {
				const base64Data = reader.result as string;
				const audioData = base64Data.split(',')[1]; // 移除 data:audio/wav;base64, 前缀

				// 调试信息
				console.log('保存录音参数:', {
					lyricId,
					word,
					lineNumber,
					audioDataLength: audioData?.length || 0,
					audioBlobSize: audioBlob.size
				});

				const requestBody = {
					lyricId,
					word,
					lineNumber,
					audioData,
					audioType: 'audio/wav',
					duration: audioBlob.size // 简单估算时长
				};

				const response = await fetch('/api/recordings', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(requestBody)
				});

				const result = await response.json();
				if (result.success) {
					hasRecording = true;
					recordingId = result.recording.id;
					cacheKey = generateCacheKey();
					
					// 立即缓存新录制的音频
					const audioUrl = URL.createObjectURL(audioBlob);
					if (cacheKey) {
						audioCache.set(cacheKey, audioBlob, audioUrl);
					}
					
					dispatch('recordingSaved', { recording: result.recording });
				} else {
					console.error('保存录音失败:', result.error);
					alert('保存录音失败: ' + result.error);
				}
			};
			reader.readAsDataURL(audioBlob);
		} catch (error) {
			console.error('保存录音失败:', error);
			alert('保存录音失败');
		}
	}

	// 从缓存播放录音
	function playFromCache(cachedAudio: { blob: Blob; url: string }) {
		if (audioElement) {
			isPlaying = true;
			audioElement.src = cachedAudio.url;
			audioElement.play();
			
			// 监听播放结束
			audioElement.onended = () => {
				isPlaying = false;
			};
		}
	}

	// 下载并缓存录音
	async function downloadAndCacheRecording(recording: any): Promise<{ blob: Blob; url: string }> {
		const audioData = recording.audioData;
		const audioBlob = new Blob([Uint8Array.from(atob(audioData), c => c.charCodeAt(0))], { type: 'audio/wav' });
		const audioUrl = URL.createObjectURL(audioBlob);
		
		// 保存到缓存
		if (cacheKey) {
			audioCache.set(cacheKey, audioBlob, audioUrl);
		}
		
		return { blob: audioBlob, url: audioUrl };
	}

	// 播放录音
	async function playRecording() {
		if (!cacheKey) return;

		try {
			// 首先检查本地缓存
			const cachedAudio = audioCache.get(cacheKey);
			if (cachedAudio) {
				console.log('从本地缓存播放录音');
				playFromCache(cachedAudio);
				return;
			}

			// 缓存中没有，从服务器下载
			console.log('从服务器下载录音');
			const params = new URLSearchParams({ lyricId });
			if (word) {
				params.append('word', word);
			} else if (lineNumber !== undefined) {
				params.append('lineNumber', lineNumber.toString());
			}

			const response = await fetch(`/api/recordings?${params}`);
			const result = await response.json();
			
			if (result.success && result.recording) {
				const cachedAudio = await downloadAndCacheRecording(result.recording);
				playFromCache(cachedAudio);
			}
		} catch (error) {
			console.error('播放录音失败:', error);
			alert('播放录音失败');
		}
	}

	// 清理缓存
	function clearCache() {
		if (cacheKey) {
			audioCache.delete(cacheKey);
		}
	}

	// 删除录音
	async function deleteRecording() {
		if (!recordingId) return;

		try {
			const response = await fetch('/api/recordings', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ recordingId })
			});

			const result = await response.json();
			if (result.success) {
				hasRecording = false;
				recordingId = null;
				// 清理本地缓存
				clearCache();
				dispatch('recordingDeleted');
			} else {
				alert('删除录音失败: ' + result.error);
			}
		} catch (error) {
			console.error('删除录音失败:', error);
			alert('删除录音失败');
		}
	}

	// 关闭菜单
	function closeMenu() {
		dispatch('close');
	}

	// 监听可见性变化
	$: if (isVisible) {
		checkRecording();
	}

	onMount(() => {
		// 点击外部关闭菜单
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (!target.closest('.recording-menu')) {
				closeMenu();
			}
		};

		// 阻止菜单内的点击事件冒泡
		const handleMenuClick = (event: MouseEvent) => {
			event.stopPropagation();
		};

		document.addEventListener('click', handleClickOutside);
		
		// 组件卸载时清理缓存
		return () => {
			document.removeEventListener('click', handleClickOutside);
			// 清理当前组件的缓存
			clearCache();
		};
	});
</script>

{#if isVisible}
	<div 
		class="recording-menu fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2"
		style="left: {position.x}px; top: {position.y}px;"
		on:click|stopPropagation
	>
		<div class="flex flex-col gap-1">
			{#if !hasRecording}
				{#if isRecording}
					<button
						class="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
						on:click={stopRecording}
					>
						⏹️ 停止录音
					</button>
				{:else}
					<button
						class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
						on:click={startRecording}
					>
						🎤 录制发音
					</button>
				{/if}
			{:else}
				<button
					class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
					on:click={playRecording}
					disabled={isPlaying}
				>
					{#if isPlaying}
						▶️ 播放中...
					{:else}
						🔊 播放录音
					{/if}
				</button>
				<button
					class="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
					on:click={deleteRecording}
				>
					🗑️ 删除录音
				</button>
			{/if}
		</div>
	</div>
{/if}

<!-- 隐藏的音频元素 -->
<audio bind:this={audioElement} style="display: none;"></audio>

<style>
	.recording-menu {
		min-width: 120px;
	}
</style> 