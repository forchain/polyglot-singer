#!/usr/bin/env node

import { spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

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

// 运行命令并等待完成
function runCommand(command, args, description) {
	return new Promise((resolve, reject) => {
		logBold(`\n🚀 ${description}...`, 'cyan');
		
		const child = spawn(command, args, {
			stdio: 'inherit',
			shell: true
		});
		
		child.on('close', (code) => {
			if (code === 0) {
				logBold(`✅ ${description} 完成！`, 'green');
				resolve();
			} else {
				logBold(`❌ ${description} 失败！退出码: ${code}`, 'red');
				reject(new Error(`Command failed with exit code ${code}`));
			}
		});
		
		child.on('error', (error) => {
			logBold(`❌ ${description} 出错: ${error.message}`, 'red');
			reject(error);
		});
	});
}

// 检查文件是否存在
function checkFileExists(filePath) {
	return existsSync(filePath);
}

function parseEnvFile(filePath) {
	if (!existsSync(filePath)) {
		return {};
	}

	const vars = {};
	const content = readFileSync(filePath, 'utf8');
	for (const rawLine of content.split('\n')) {
		const line = rawLine.trim();
		if (!line || line.startsWith('#')) continue;
		const equalIndex = line.indexOf('=');
		if (equalIndex > 0) {
			vars[line.slice(0, equalIndex).trim()] = line.slice(equalIndex + 1).trim();
		}
	}
	return vars;
}

// 主函数
async function main() {
	const projectRoot = process.cwd();
	const envPath = join(projectRoot, '.env');
	
	logBold('🎵 Polyglot Singer 启动脚本', 'magenta');
	logBold('================================', 'magenta');
	
	try {
		// 1. 检查环境配置
		logBold('\n📋 步骤 1: 检查环境配置', 'cyan');
		await runCommand('node', ['scripts/check-env.js'], '环境配置检查');
		
		// 2. 检查 .env 文件是否存在
		if (!checkFileExists(envPath)) {
			logBold('\n⚠️  警告: .env 文件不存在！', 'yellow');
			log('请先运行环境配置检查并创建 .env 文件', 'yellow');
			log('运行: node scripts/check-env.js', 'blue');
			process.exit(1);
		}
		
		// 3. 检查后端 Provider
		logBold('\n📋 步骤 2: 检查后端 Provider', 'cyan');
		const envVars = parseEnvFile(envPath);
		const backendProvider = envVars.BACKEND_PROVIDER || 'postgres';

		if (backendProvider === 'pocketbase') {
			if (!envVars.POCKETBASE_URL) {
				logBold('\n❌ BACKEND_PROVIDER=pocketbase 需要配置 POCKETBASE_URL', 'red');
				process.exit(1);
			}
			logBold('✅ PocketBase Provider 已配置', 'green');
			log('请确认 PocketBase 已在另一个终端运行：', 'blue');
			log('pocketbase serve --migrationsDir=./pb_migrations', 'blue');
		} else {
			const dbPath = join(projectRoot, 'dev.db');
			if (!checkFileExists(dbPath)) {
				logBold('\n🗄️  数据库文件不存在，正在设置数据库...', 'yellow');
				await runCommand('npm', ['run', 'db:setup'], '数据库设置');
			} else {
				logBold('✅ 数据库文件已存在', 'green');
			}
		}
		
		// 4. 检查依赖
		logBold('\n📋 步骤 3: 检查依赖', 'cyan');
		const nodeModulesPath = join(projectRoot, 'node_modules');
		
		if (!checkFileExists(nodeModulesPath)) {
			logBold('\n📦 依赖未安装，正在安装...', 'yellow');
			await runCommand('npm', ['install'], '安装依赖');
		} else {
			logBold('✅ 依赖已安装', 'green');
		}
		
		// 5. 启动开发服务器
		logBold('\n📋 步骤 4: 启动开发服务器', 'cyan');
		logBold('\n🎉 所有检查完成！正在启动应用...', 'green');
		log('应用将在 http://localhost:5173 启动', 'blue');
		log('按 Ctrl+C 停止服务器', 'blue');
		
		// 启动开发服务器
		await runCommand('npm', ['run', 'dev'], '启动开发服务器');
		
	} catch (error) {
		logBold(`\n❌ 启动失败: ${error.message}`, 'red');
		logBold('\n🔧 故障排除建议：', 'yellow');
		log('1. 检查 .env 文件配置是否正确', 'blue');
		log('2. 确保所有依赖已正确安装', 'blue');
		log('3. 检查数据库配置和连接', 'blue');
		log('4. 查看错误日志获取详细信息', 'blue');
		logBold('\n📖 相关文档：', 'cyan');
		log('- 环境配置: env.example', 'cyan');
		log('- Supabase 设置: SUPABASE_SETUP.md', 'cyan');
		log('- 数据库迁移: DATABASE_MIGRATION_SUMMARY.md', 'cyan');
		process.exit(1);
	}
}

// 运行主函数
main().catch(error => {
	logBold(`\n💥 严重错误: ${error.message}`, 'red');
	process.exit(1);
}); 
