// 全局音频缓存管理器
class AudioCacheManager {
	private cache = new Map<string, { blob: Blob; url: string; timestamp: number }>();
	private maxCacheSize = 50; // 最大缓存数量
	private maxAge = 24 * 60 * 60 * 1000; // 24小时过期时间

	// 生成缓存键
	generateKey(lyricId: string, word?: string, lineNumber?: number): string {
		if (word) {
			return `word_${lyricId}_${word}`;
		} else if (lineNumber !== undefined) {
			return `line_${lyricId}_${lineNumber}`;
		}
		return '';
	}

	// 获取缓存
	get(key: string): { blob: Blob; url: string } | null {
		const cached = this.cache.get(key);
		if (!cached) return null;

		// 检查是否过期
		if (Date.now() - cached.timestamp > this.maxAge) {
			this.delete(key);
			return null;
		}

		return { blob: cached.blob, url: cached.url };
	}

	// 设置缓存
	set(key: string, blob: Blob, url: string): void {
		// 如果缓存已满，删除最旧的条目
		if (this.cache.size >= this.maxCacheSize) {
			this.evictOldest();
		}

		this.cache.set(key, {
			blob,
			url,
			timestamp: Date.now()
		});
	}

	// 删除缓存
	delete(key: string): boolean {
		const cached = this.cache.get(key);
		if (cached) {
			URL.revokeObjectURL(cached.url);
			return this.cache.delete(key);
		}
		return false;
	}

	// 清理过期缓存
	cleanup(): void {
		const now = Date.now();
		for (const [key, cached] of this.cache.entries()) {
			if (now - cached.timestamp > this.maxAge) {
				this.delete(key);
			}
		}
	}

	// 删除最旧的缓存条目
	private evictOldest(): void {
		let oldestKey: string | null = null;
		let oldestTime = Date.now();

		for (const [key, cached] of this.cache.entries()) {
			if (cached.timestamp < oldestTime) {
				oldestTime = cached.timestamp;
				oldestKey = key;
			}
		}

		if (oldestKey) {
			this.delete(oldestKey);
		}
	}

	// 获取缓存统计信息
	getStats(): { size: number; maxSize: number } {
		return {
			size: this.cache.size,
			maxSize: this.maxCacheSize
		};
	}

	// 清空所有缓存
	clear(): void {
		for (const [key] of this.cache.entries()) {
			this.delete(key);
		}
	}
}

// 创建全局实例
export const audioCache = new AudioCacheManager();

// 定期清理过期缓存（每小时清理一次）
setInterval(() => {
	audioCache.cleanup();
}, 60 * 60 * 1000); 