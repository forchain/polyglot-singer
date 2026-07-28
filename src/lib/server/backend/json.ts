export function parseJsonField<T>(value: unknown, fallback: T | null = null): T | null {
	if (value == null || value === '') {
		return fallback;
	}

	if (typeof value === 'string') {
		try {
			return JSON.parse(value) as T;
		} catch {
			return fallback;
		}
	}

	return value as T;
}

export function toJsonString(value: unknown): string | null {
	if (value == null) {
		return null;
	}

	return typeof value === 'string' ? value : JSON.stringify(value);
}

export function normalizePreferences<T extends Record<string, unknown>>(preferences: T): T {
	return {
		...preferences,
		defaultVoices: toJsonString(preferences.defaultVoices)
	};
}
