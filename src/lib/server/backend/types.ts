import type { AppUser } from '$lib/types/auth';
import type { WordGrammarAnalysis } from '$lib/types/lyric';

export interface AuthProvider {
	login(email: string, password: string): Promise<AuthResult>;
	register(email: string, password: string): Promise<AuthResult>;
	logout(): Promise<void>;
}

export interface AuthResult {
	user: AppUser;
	cookie?: string;
	message?: string;
}

export interface CreateAnalysisInput {
	userId: string;
	title?: string;
	artist?: string;
	lyrics: string;
	sourceLanguage: string;
	targetLanguage: string;
	analysisJson: string;
	voice?: string | null;
}

export interface AnalysisListItem {
	id: string;
	title: string | null;
	artist: string | null;
	createdAt: Date | string | null;
	isPublic: boolean | null;
}

export interface AnalysisRecord extends AnalysisListItem {
	userId: string | null;
	lyrics: string;
	sourceLanguage: string;
	targetLanguage: string;
	analysisJson: string;
	voice?: string | null;
}

export interface GalleryItem {
	id: string;
	title: string | null;
	artist: string | null;
	userId: string | null;
	createdAt: Date | string | null;
	lyrics: string;
}

export interface AnalysisRepository {
	create(input: CreateAnalysisInput): Promise<string>;
	listForUser(userId: string): Promise<AnalysisListItem[]>;
	getAccessible(id: string, userId?: string | null): Promise<AnalysisRecord | null>;
	updatePublic(id: string, userId: string, isPublic: boolean): Promise<void>;
	updateVoice(id: string, userId: string, voice: string): Promise<boolean>;
	listPublic(limit?: number): Promise<GalleryItem[]>;
}

export interface PreferencesRepository {
	get(userId: string): Promise<Record<string, unknown> | null>;
	upsert(userId: string, values: Record<string, unknown>): Promise<void>;
}

export interface WordGrammarRepository {
	get(word: string, language: string): Promise<WordGrammarAnalysis | null>;
	save(analysis: WordGrammarAnalysis): Promise<void>;
}

export interface BackendRepositories {
	analysis: AnalysisRepository;
	preferences: PreferencesRepository;
	wordGrammar: WordGrammarRepository;
}
