# Polyglot Singer - Setup Guide

This guide will help you set up the Polyglot Singer development environment.

## Prerequisites

- Node.js 18+ and npm
- OpenAI API key

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```bash
# AI Provider Configuration (Choose one)
# Option 1: OpenAI
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_MODEL_DETECTION=gpt-4.1-nano

# Option 2: Anthropic Claude
# AI_PROVIDER=anthropic
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
# ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
# ANTHROPIC_MODEL_DETECTION=claude-3-haiku-20240307

# Option 3: Google Gemini
# AI_PROVIDER=google
# GOOGLE_API_KEY=your_google_api_key_here
# GOOGLE_MODEL=gemini-1.5-pro
# GOOGLE_MODEL_DETECTION=gemini-1.5-flash

# Option 4: Local Model (Ollama)
# AI_PROVIDER=local
# LOCAL_BASE_URL=http://localhost:11434/v1
# LOCAL_MODEL=llama3.2:3b

# Option 5: Custom Provider
# AI_PROVIDER=custom
# CUSTOM_AI_BASE_URL=https://your-custom-api.com/v1
# CUSTOM_AI_MODEL=your-model-name
# CUSTOM_AI_API_KEY=your_api_key

# Database Configuration
DATABASE_URL=sqlite:dev.db

# Application Configuration
PUBLIC_APP_NAME=Polyglot Singer
PUBLIC_APP_URL=http://localhost:5173

# Security (generate a random 32+ character string)
SESSION_SECRET=your_random_session_secret_here_minimum_32_characters
```

### 3. Database Setup

Generate and run database migrations:

```bash
npm run db:generate
npm run db:migrate
```

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:5173 to see the application.

## Project Structure

```
src/
├── routes/                 # SvelteKit pages and API routes
│   ├── +layout.svelte     # Global layout
│   ├── +page.svelte       # Home page
│   ├── analyze/           # Lyric analysis page
│   └── api/               # API endpoints
├── lib/
│   ├── components/        # Reusable Svelte components
│   ├── server/           # Server-side code
│   │   ├── database/     # Database schema and connection
│   │   └── services/     # Business logic services
│   ├── types/            # TypeScript type definitions
│   └── styles/           # Global CSS styles
└── app.html              # HTML template
```

## Key Features Implemented

### ✅ Core Functionality
- [x] SvelteKit project structure
- [x] TypeScript configuration
- [x] Tailwind CSS styling
- [x] Drizzle ORM with SQLite
- [x] Lucia authentication
- [x] OpenAI API integration
- [x] Lyric analysis API endpoint
- [x] Word-by-word display components

### ✅ User Interface
- [x] Responsive navigation
- [x] Home page with features
- [x] Lyric analysis form
- [x] Language selector
- [x] Perfect word alignment CSS
- [x] Loading states and error handling

### ✅ Database Schema
- [x] Users and sessions
- [x] Lyrics storage
- [x] Learning progress tracking
- [x] User preferences

## Development Workflow

### Database Operations

```bash
# Generate new migration
npm run db:generate

# Apply migrations
npm run db:migrate

# Open database studio
npm run db:studio
```

### Code Quality

```bash
# Type checking
npm run check

# Linting
npm run lint

# Formatting
npm run format
```

### Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration
```

## Deployment

### Build for Production

```bash
npm run build
npm run preview
```

### Environment Variables for Production

Update your production environment with:

```bash
OPENAI_API_KEY=your_production_openai_key
DATABASE_URL=your_production_database_url
SESSION_SECRET=your_production_session_secret
PUBLIC_APP_URL=https://yourdomain.com
```

## Getting Your OpenAI API Key

1. Visit https://platform.openai.com/api-keys
2. Create a new API key
3. Add it to your `.env` file
4. Make sure you have credits in your OpenAI account

## Troubleshooting

### Common Issues

1. **OPENAI_API_KEY not found**
   - Make sure you've created the `.env` file
   - Verify the API key is correct and has credits

2. **Database connection errors**
   - Run `npm run db:generate && npm run db:migrate`
   - Check that the database file has proper permissions

3. **TypeScript errors**
   - Run `npm run check` to see all type errors
   - Make sure all dependencies are installed

4. **CSS not loading**
   - Verify Tailwind CSS is properly configured
   - Check that `src/lib/styles/global.css` is imported

### Performance Tips

1. **Development**
   - Use `npm run dev` for hot reloading
   - Enable browser dev tools for debugging

2. **Production**
   - Use PostgreSQL instead of SQLite for better performance
   - Consider adding Redis for caching
   - Enable gzip compression on your hosting provider

## Next Steps

To continue development:

1. Implement user authentication pages (`/login`, `/register`)
2. Add lyric library management (`/library`)
3. Create user profile and settings pages
4. Add audio synchronization features
5. Implement learning progress tracking
6. Add social features for sharing lyrics

## Support

If you encounter issues:

1. Check this setup guide
2. Review the error messages in the console
3. Ensure all environment variables are set correctly
4. Verify your OpenAI API key has sufficient credits

Happy coding! 🎵 