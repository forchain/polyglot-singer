#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
try {
    const envPath = join(__dirname, '..', '.env');
    const envContent = readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
        if (line && !line.startsWith('#') && line.includes('=')) {
            const [key, ...valueParts] = line.split('=');
            const value = valueParts.join('=').trim();
            
            // 移除引号
            const cleanValue = value.replace(/^["']|["']$/g, '');
            process.env[key.trim()] = cleanValue;
        }
    });
} catch (error) {
    console.log('⚠️ 无法读取 .env 文件，使用系统环境变量');
}

console.log('🔍 数据库连接测试开始...\n');

// 1. 检查环境变量
console.log('📋 环境变量检查:');
console.log(`DATABASE_TYPE: ${process.env.DATABASE_TYPE || '未设置'}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '已设置' : '未设置'}`);

if (process.env.DATABASE_URL) {
    // 隐藏敏感信息
    const url = process.env.DATABASE_URL;
    const maskedUrl = url.replace(/:([^:@]+)@/, ':****@');
    console.log(`DATABASE_URL: ${maskedUrl}`);
}

console.log('');

// 2. 测试 PostgreSQL 连接
if (process.env.DATABASE_TYPE === 'postgres') {
    console.log('🐘 测试 PostgreSQL 连接...');
    
    try {
        // 动态导入 pg 模块
        const { Client } = await import('pg');
        
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });
        
        console.log('⏳ 正在连接数据库...');
        await client.connect();
        console.log('✅ PostgreSQL 连接成功!');
        
        // 测试查询
        console.log('⏳ 测试查询...');
        const result = await client.query('SELECT version()');
        console.log('✅ 查询成功!');
        console.log(`数据库版本: ${result.rows[0].version.split(' ')[0]}`);
        
        // 检查表是否存在
        console.log('⏳ 检查现有表...');
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        if (tablesResult.rows.length > 0) {
            console.log('📋 现有表:');
            tablesResult.rows.forEach(row => {
                console.log(`  - ${row.table_name}`);
            });
        } else {
            console.log('📋 数据库中没有表');
        }
        
        await client.end();
        console.log('✅ PostgreSQL 连接测试完成\n');
        
    } catch (error) {
        console.error('❌ PostgreSQL 连接失败:');
        console.error(`错误类型: ${error.constructor.name}`);
        console.error(`错误消息: ${error.message}`);
        console.error(`错误代码: ${error.code || 'N/A'}`);
        
        if (error.code === 'ENOTFOUND') {
            console.error('💡 建议: 检查 DATABASE_URL 中的主机名是否正确');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('💡 建议: 检查数据库服务是否运行，端口是否正确');
        } else if (error.code === '28P01') {
            console.error('💡 建议: 检查用户名和密码是否正确');
        } else if (error.code === '3D000') {
            console.error('💡 建议: 检查数据库名是否存在');
        }
        
        console.log('');
    }
}

// 3. 测试 SQLite 连接
if (process.env.DATABASE_TYPE === 'sqlite') {
    console.log('🗄️ 测试 SQLite 连接...');
    
    try {
        const { Database } = await import('better-sqlite3');
        const dbPath = process.env.DATABASE_URL.replace('sqlite:', '');
        
        console.log(`⏳ 正在连接 SQLite 数据库: ${dbPath}`);
        const db = new Database(dbPath);
        
        console.log('✅ SQLite 连接成功!');
        
        // 测试查询
        console.log('⏳ 测试查询...');
        const version = db.prepare('SELECT sqlite_version()').get();
        console.log(`✅ 查询成功! SQLite 版本: ${version['sqlite_version()']}`);
        
        // 检查表
        console.log('⏳ 检查现有表...');
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        
        if (tables.length > 0) {
            console.log('📋 现有表:');
            tables.forEach(table => {
                console.log(`  - ${table.name}`);
            });
        } else {
            console.log('📋 数据库中没有表');
        }
        
        db.close();
        console.log('✅ SQLite 连接测试完成\n');
        
    } catch (error) {
        console.error('❌ SQLite 连接失败:');
        console.error(`错误类型: ${error.constructor.name}`);
        console.error(`错误消息: ${error.message}`);
        console.log('');
    }
}

// 4. 测试 Drizzle 配置
console.log('🔧 测试 Drizzle 配置...');

try {
    const { drizzle } = await import('drizzle-orm/node-postgres');
    const { Pool } = await import('pg');
    
    if (process.env.DATABASE_TYPE === 'postgres') {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });
        
        const db = drizzle(pool);
        console.log('✅ Drizzle PostgreSQL 配置成功!');
        
        await pool.end();
    }
    
} catch (error) {
    console.error('❌ Drizzle 配置失败:');
    console.error(`错误消息: ${error.message}`);
    console.log('');
}

// 5. 测试迁移文件
console.log('📁 检查迁移文件...');

try {
    const { readdirSync } = await import('fs');
    const drizzleDir = join(__dirname, '..', 'drizzle');
    
    if (readdirSync(drizzleDir).some(file => file.endsWith('.sql'))) {
        console.log('✅ 找到迁移文件');
        
        const migrationFiles = readdirSync(drizzleDir)
            .filter(file => file.endsWith('.sql'))
            .sort();
        
        console.log('📋 迁移文件列表:');
        migrationFiles.forEach(file => {
            console.log(`  - ${file}`);
        });
    } else {
        console.log('⚠️ 没有找到迁移文件');
    }
    
} catch (error) {
    console.error('❌ 检查迁移文件失败:');
    console.error(`错误消息: ${error.message}`);
}

console.log('\n🎯 测试总结:');
console.log('1. 如果 PostgreSQL 连接成功，说明环境配置正确');
console.log('2. 如果连接失败，请检查 DATABASE_URL 格式');
console.log('3. 如果 Drizzle 配置失败，可能是依赖问题');
console.log('4. 如果迁移文件有问题，可能需要重新生成');

console.log('\n💡 建议:');
console.log('- 确保 DATABASE_URL 格式正确: postgresql://user:password@host:port/database');
console.log('- 检查网络连接和防火墙设置');
console.log('- 验证数据库凭据是否正确');
console.log('- 确保数据库服务正在运行'); 