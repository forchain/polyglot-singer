import type { BackendRepositories } from '../types';
import { createPocketBaseClientBundle, type PocketBaseClientBundle } from './client';
import { createPocketBaseAnalysisRepository } from './analysis-repository';
import { createPocketBasePreferencesRepository } from './preferences-repository';
import { createPocketBaseWordGrammarRepository } from './word-grammar-repository';

export function createPocketBaseRepositories(
	bundle: PocketBaseClientBundle = createPocketBaseClientBundle()
): BackendRepositories {
	return {
		analysis: createPocketBaseAnalysisRepository(bundle),
		preferences: createPocketBasePreferencesRepository(bundle),
		wordGrammar: createPocketBaseWordGrammarRepository(bundle)
	};
}

export {
	clearPocketBaseAuth,
	getPocketBaseUser,
	loginWithPocketBase,
	refreshPocketBaseAuth,
	registerWithPocketBase
} from './auth';
