#!/bin/bash

# Polyglot Singer 启动脚本
# 这个脚本会检查环境配置并启动应用

set -e  # 遇到错误时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${2}${1}${NC}"
}

print_bold() {
    echo -e "${CYAN}${1}${NC}"
}

# 检查 Node.js 是否安装
check_node() {
    if ! command -v node &> /dev/null; then
        print_message "❌ Node.js 未安装！请先安装 Node.js" $RED
        print_message "下载地址: https://nodejs.org/" $BLUE
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    print_message "✅ Node.js 版本: $NODE_VERSION" $GREEN
}

# 检查 npm 是否安装
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_message "❌ npm 未安装！" $RED
        exit 1
    fi
    
    NPM_VERSION=$(npm --version)
    print_message "✅ npm 版本: $NPM_VERSION" $GREEN
}

# 主函数
main() {
    print_bold "🎵 Polyglot Singer 启动脚本"
    print_bold "================================"
    
    # 检查 Node.js 和 npm
    print_message "\n📋 检查系统环境..." $CYAN
    check_node
    check_npm
    
    # 检查项目文件
    if [ ! -f "package.json" ]; then
        print_message "❌ 未找到 package.json，请确保在项目根目录运行此脚本" $RED
        exit 1
    fi
    
    if [ ! -f "env.example" ]; then
        print_message "❌ 未找到 env.example 文件" $RED
        exit 1
    fi
    
    print_message "✅ 项目文件检查完成" $GREEN
    
    # 运行 Node.js 启动脚本
    print_message "\n🚀 启动应用..." $CYAN
    node scripts/start.js
}

# 错误处理
trap 'print_message "\n❌ 脚本执行被中断" $RED; exit 1' INT TERM

# 运行主函数
main "$@" 