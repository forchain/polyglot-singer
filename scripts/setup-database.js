#!/usr/bin/env node

import { spawn } from 'child_process';
import { readFileSync, existsSync, copyFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read environment variables
const envPath = join(__dirname, '..', '.env');
let envVars = {};

try {
	const envContent = readFileSync(envPath, 'utf8');
	envContent.split('\n').forEach(line => {
		if (line.trim() && !line.startsWith('#')) {
			const [key, ...valueParts] = line.split('=');
			const value = valueParts.join('=').trim();
			if (key && value) {
				// 移除引号
				const cleanValue = value.replace(/^["']|["']$/g, '');
				envVars[key.trim()] = cleanValue;
			}
		}
	});
} catch (error) {
	console.log('No .env file found, using defaults');
}

const databaseType = envVars.DATABASE_TYPE || 'sqlite';

console.log(`Setting up database for: ${databaseType}`);

// Set environment variables for drizzle-kit
Object.keys(envVars).forEach(key => {
	process.env[key] = envVars[key];
});

// Function to run command and return promise
function runCommand(command, args, description) {
	return new Promise((resolve, reject) => {
		console.log(`⏳ ${description}...`);
		const child = spawn(command, args, {
			stdio: 'inherit',
			env: { ...process.env, ...envVars }
		});
		
		child.on('close', (code) => {
			if (code === 0) {
				console.log(`✅ ${description} completed successfully`);
				resolve();
			} else {
				console.error(`❌ ${description} failed with exit code ${code}`);
				reject(new Error(`${description} failed with exit code ${code}`));
			}
		});
	});
}

// Function to handle database-specific migration
async function handleDatabaseMigration() {
	const drizzleDir = join(__dirname, '..', 'drizzle');
	
	if (databaseType === 'sqlite') {
		// For SQLite, use the SQLite-specific migration file if it exists
		const sqliteMigrationFile = join(drizzleDir, '0000_harsh_captain_stacy.sqlite.sql');
		const defaultMigrationFile = join(drizzleDir, '0000_harsh_captain_stacy.sql');
		
		if (existsSync(sqliteMigrationFile)) {
			console.log('📁 Using SQLite-specific migration file');
			// Backup original file
			if (existsSync(defaultMigrationFile)) {
				copyFileSync(defaultMigrationFile, defaultMigrationFile + '.backup');
			}
			// Copy SQLite version to default location
			copyFileSync(sqliteMigrationFile, defaultMigrationFile);
		}
	} else if (databaseType === 'postgres') {
		// For PostgreSQL, ensure we're using the PostgreSQL-compatible file
		const defaultMigrationFile = join(drizzleDir, '0000_harsh_captain_stacy.sql');
		const backupFile = defaultMigrationFile + '.backup';
		
		// Restore from backup if it exists (was previously using SQLite version)
		if (existsSync(backupFile)) {
			console.log('📁 Restoring PostgreSQL migration file from backup');
			copyFileSync(backupFile, defaultMigrationFile);
			unlinkSync(backupFile);
		}
	}
}

// Main setup process
async function main() {
	try {
		// Handle database-specific migration files
		await handleDatabaseMigration();
		
		// Generate migrations
		await runCommand('npx', ['drizzle-kit', 'generate'], 'Generating migrations');
		
		// Run migrations
		await runCommand('npx', ['drizzle-kit', 'migrate'], 'Running migrations');
		
		console.log('🎉 Database setup completed successfully!');
		
		// Show additional setup instructions
		if (databaseType === 'postgres' || databaseType === 'supabase') {
			console.log('\n📝 PostgreSQL/Supabase Setup Complete!');
			console.log('Make sure to:');
			console.log('1. Set up your Supabase project at https://supabase.com');
			console.log('2. Copy the connection string from your project settings');
			console.log('3. Update your .env file with the correct DATABASE_URL');
			console.log('4. Run the setup script again if needed');
		} else {
			console.log('\n📝 SQLite Setup Complete!');
			console.log('Your local database is ready for development.');
		}
		
	} catch (error) {
		console.error('❌ Database setup failed:', error.message);
		process.exit(1);
	}
}

// Run the main function
main(); 