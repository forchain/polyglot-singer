export interface BackendError {
	status: number;
	message: string;
	cause?: unknown;
}

export function mapPocketBaseError(error: unknown): BackendError {
	const status = typeof (error as any)?.status === 'number' ? (error as any).status : undefined;

	if (status === 400) {
		return { status: 400, message: 'Validation failed', cause: error };
	}
	if (status === 401 || status === 403) {
		return { status: 401, message: 'Unauthorized', cause: error };
	}
	if (status === 404) {
		return { status: 404, message: 'Not found', cause: error };
	}

	const message = error instanceof Error ? error.message : String(error);
	if (error instanceof TypeError || /fetch failed|network|ECONNREFUSED|ENOTFOUND/i.test(message)) {
		return { status: 503, message: 'Backend unavailable', cause: error };
	}

	return { status: 500, message: 'Backend error', cause: error };
}
