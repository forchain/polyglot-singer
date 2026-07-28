import type { BackendRepositories } from '../types';
import { createPostgresAnalysisRepository } from './analysis-repository';
import { createPostgresPreferencesRepository } from './preferences-repository';
import { createPostgresWordGrammarRepository } from './word-grammar-repository';

export function createPostgresRepositories(): BackendRepositories {
	return {
		analysis: createPostgresAnalysisRepository(),
		preferences: createPostgresPreferencesRepository(),
		wordGrammar: createPostgresWordGrammarRepository()
	};
}

export { normalizeSupabaseUser } from './auth';
