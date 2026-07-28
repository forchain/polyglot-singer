#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';

// 颜色输出函数
const colors = {
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
	reset: '\x1b[0m',
	bold: '\x1b[1m'
};

function log(message, color = 'reset') {
	console.log(`${colors[color]}${message}${colors.reset}`);
}

function logBold(message, color = 'reset') {
	console.log(`${colors[color]}${colors.bold}${message}${colors.reset}`);
}

// 解析环境变量文件
function parseEnvFile(filePath) {
	if (!existsSync(filePath)) {
		return {};
	}
	
	const content = readFileSync(filePath, 'utf8');
	const envVars = {};
	
	content.split('\n').forEach(line => {
		line = line.trim();
		if (line && !line.startsWith('#')) {
			const equalIndex = line.indexOf('=');
			if (equalIndex > 0) {
				const key = line.substring(0, equalIndex).trim();
				const value = line.substring(equalIndex + 1).trim();
				envVars[key] = value;
			}
		}
	});
	
	return envVars;
}

// 获取注释信息
function getComments(filePath) {
	if (!existsSync(filePath)) {
		return {};
	}
	
	const content = readFileSync(filePath, 'utf8');
	const comments = {};
	let currentKey = null;
	
	content.split('\n').forEach(line => {
		line = line.trim();
		if (line.startsWith('#')) {
			if (currentKey) {
				comments[currentKey] = line.substring(1).trim();
			}
		} else if (line && !line.startsWith('#')) {
			const equalIndex = line.indexOf('=');
			if (equalIndex > 0) {
				currentKey = line.substring(0, equalIndex).trim();
			}
		}
	});
	
	return comments;
}

// 合并环境变量 - 只添加缺失的变量，不覆盖现有的
function mergeEnvFiles(examplePath, envPath) {
	const exampleVars = parseEnvFile(examplePath);
	const envVars = parseEnvFile(envPath);
	const comments = getComments(examplePath);
	
	const merged = { ...envVars };
	const newVars = [];
	const updatedVars = [];
	
	// 只检查新增的变量，不覆盖现有的
	Object.keys(exampleVars).forEach(key => {
		if (!(key in envVars)) {
			merged[key] = exampleVars[key];
			newVars.push(key);
		} else if (envVars[key] === exampleVars[key] && exampleVars[key].includes('your_')) {
			// 检查是否有默认值需要更新，但不自动更新
			updatedVars.push(key);
		}
	});
	
	return { merged, newVars, updatedVars, comments };
}

// 智能合并 .env 文件内容，保留现有结构和注释
function smartMergeEnvContent(examplePath, envPath) {
	if (!existsSync(envPath)) {
		// 如果 .env 不存在，直接复制 env.example
		const exampleContent = readFileSync(examplePath, 'utf8');
		writeFileSync(envPath, exampleContent);
		return { newVars: Object.keys(parseEnvFile(examplePath)), updatedVars: [] };
	}
	
	const exampleVars = parseEnvFile(examplePath);
	const existingContent = readFileSync(envPath, 'utf8');
	const existingVars = parseEnvFile(envPath);
	
	const newVars = [];
	const updatedVars = [];
	
	// 检查哪些变量是新增的
	Object.keys(exampleVars).forEach(key => {
		if (!(key in existingVars)) {
			newVars.push(key);
		} else if (existingVars[key] === exampleVars[key] && exampleVars[key].includes('your_')) {
			updatedVars.push(key);
		}
	});
	
	// 如果没有新变量，直接返回
	if (newVars.length === 0) {
		return { newVars: [], updatedVars };
	}
	
	// 在现有 .env 文件末尾添加新变量
	let newContent = existingContent;
	
	// 确保文件以换行符结尾
	if (!newContent.endsWith('\n')) {
		newContent += '\n';
	}
	
	// 添加新变量的注释和值
	newVars.forEach(key => {
		const comment = getComments(examplePath)[key];
		if (comment) {
			newContent += `# ${comment}\n`;
		}
		newContent += `${key}=${exampleVars[key]}\n`;
	});
	
	writeFileSync(envPath, newContent);
	
	return { newVars, updatedVars };
}

// 显示需要更新的变量
function showUpdatePrompt(newVars, updatedVars, comments) {
	if (newVars.length === 0 && updatedVars.length === 0) {
		logBold('✅ 环境配置检查完成！所有配置都是最新的。', 'green');
		return false;
	}
	
	logBold('\n🔧 环境配置检查结果：', 'cyan');
	
	if (newVars.length > 0) {
		logBold(`\n📝 发现 ${newVars.length} 个新增配置项：`, 'yellow');
		newVars.forEach(key => {
			const comment = comments[key] || '无描述';
			log(`  ${colors.cyan}${key}${colors.reset} - ${comment}`, 'yellow');
		});
	}
	
	if (updatedVars.length > 0) {
		logBold(`\n⚠️  发现 ${updatedVars.length} 个需要更新的配置项：`, 'yellow');
		updatedVars.forEach(key => {
			const comment = comments[key] || '无描述';
			log(`  ${colors.cyan}${key}${colors.reset} - ${comment}`, 'yellow');
		});
	}
	
	logBold('\n💡 建议操作：', 'blue');
	log('1. 检查新增的配置项，根据注释说明进行配置', 'blue');
	log('2. 更新需要修改的配置项（如 API 密钥、数据库连接等）', 'blue');
	log('3. 确保 SESSION_SECRET 是随机生成的 32+ 字符字符串', 'blue');
	log('4. 配置正确的后端 Provider 信息（Supabase/Postgres 或 PocketBase）', 'blue');
	
	return true;
}

// 主函数
async function main() {
	const projectRoot = process.cwd();
	const examplePath = join(projectRoot, 'env.example');
	const envPath = join(projectRoot, '.env');
	
	logBold('🔍 检查环境配置...', 'cyan');
	
	// 检查 env.example 是否存在
	if (!existsSync(examplePath)) {
		log('❌ env.example 文件不存在！', 'red');
		process.exit(1);
	}
	
	// 智能合并环境变量文件
	const { newVars, updatedVars } = smartMergeEnvContent(examplePath, envPath);
	const comments = getComments(examplePath);
	
	// 显示更新提示
	const hasUpdates = showUpdatePrompt(newVars, updatedVars, comments);
	
	if (hasUpdates) {
		logBold('\n📝 已自动将新增配置添加到 .env 文件！', 'green');
		log('(保留了您现有的配置，只添加了新的配置项)', 'blue');
		
		logBold('\n⚠️  重要提醒：', 'yellow');
		log('请检查并更新以下关键配置项：', 'yellow');
		
		const importantKeys = ['SESSION_SECRET', 'BACKEND_PROVIDER', 'DATABASE_URL', 'POCKETBASE_URL', 'AI_PROVIDER', 'DOUBAO_API_KEY'];
		importantKeys.forEach(key => {
			const currentVars = parseEnvFile(envPath);
			if (currentVars[key] && currentVars[key].includes('your_')) {
				log(`  - ${key}: 需要设置实际值`, 'red');
			}
		});
		
		logBold('\n📖 配置说明：', 'blue');
		log('- SESSION_SECRET: 生成随机字符串，至少32字符', 'blue');
		log('- BACKEND_PROVIDER: postgres 或 pocketbase', 'blue');
		log('- DATABASE_URL: Supabase/Postgres 使用连接字符串', 'blue');
		log('- POCKETBASE_URL: PocketBase 服务地址，例如 http://127.0.0.1:8090', 'blue');
		log('- AI_PROVIDER: 选择 AI 提供商并配置对应的 API 密钥', 'blue');
		log('- DOUBAO_API_KEY: 豆包 API 密钥（默认提供商）', 'blue');
		
		logBold('\n🔗 相关文档：', 'cyan');
		log('- 环境变量说明: env.example', 'cyan');
		log('- Supabase 设置: SUPABASE_SETUP.md', 'cyan');
		log('- PocketBase: pocketbase serve --migrationsDir=./pb_migrations', 'cyan');
		log('- 数据库迁移: DATABASE_MIGRATION_SUMMARY.md', 'cyan');
	} else {
		logBold('\n🚀 环境配置检查完成，可以继续运行应用！', 'green');
	}
	
	// 检查是否要运行数据库设置
	if (newVars.some(key => key.includes('DATABASE'))) {
		logBold('\n🗄️  检测到数据库配置变更，是否运行数据库设置？', 'magenta');
		log('运行命令: npm run db:setup', 'blue');
	}
	
	logBold('\n✨ 环境检查完成！', 'green');
}

// 运行主函数
main().catch(error => {
	log(`❌ 脚本执行错误: ${error.message}`, 'red');
	process.exit(1);
}); 
