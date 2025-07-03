// Re-export database types for consistency
export type { User, NewUser } from '$lib/server/database/schema.js';

// Extended user profile interface
export interface UserProfile {
	id: string;
	email: string;
	name: string;
	createdAt: Date;
	preferences?: UserPreferences;
	stats?: UserStats;
}

// User preferences interface
export interface UserPreferences {
	preferredSourceLanguage: string;
	preferredTargetLanguage: string;
	phoneticStyle: 'ipa' | 'simplified';
	showPinyin: boolean;
	autoSave: boolean;
	theme?: 'light' | 'dark' | 'system';
	notifications?: {
		practiceReminders: boolean;
		weeklyProgress: boolean;
		newFeatures: boolean;
	};
}

// User statistics interface
export interface UserStats {
	totalLyrics: number;
	totalPracticeTime: number; // in minutes
	wordsLearned: number;
	streakDays: number;
	favoriteLanguages: string[];
	lastActivity: Date;
}

// Authentication forms
export interface LoginForm {
	email: string;
	password: string;
}

export interface RegisterForm {
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
}

export interface UpdateProfileForm {
	name?: string;
	email?: string;
	currentPassword?: string;
	newPassword?: string;
	confirmPassword?: string;
}

// Session and authentication state
export interface AuthState {
	isAuthenticated: boolean;
	user: UserProfile | null;
	loading: boolean;
	error?: string;
} 