# Polyglot Singer 🎵
*Become a polyglot by singing songs*

A innovative language learning platform that combines the joy of singing with effective vocabulary acquisition through AI-powered lyric analysis and phonetic annotation.

## 🎯 Project Vision

Transform language learning into an enjoyable musical experience by leveraging the natural advantages of songs:
- **Universal Appeal**: Singing is accessible and enjoyable for everyone
- **Memory Enhancement**: Melodies help retain lyrics and vocabulary
- **High Engagement**: Entertainment value drives sustained learning motivation
- **Natural Repetition**: Songs encourage repeated practice without fatigue

## 📋 Requirements Analysis

### Core User Journey
1. User inputs song lyrics in target language
2. AI processes lyrics for word-by-word translation and phonetic transcription
3. Display formatted lyrics with aligned pronunciation and meaning
4. User sings along while learning vocabulary contextually

### Functional Requirements

#### Primary Features
- **Lyric Input Interface**: Multi-line text input with language detection
- **AI-Powered Analysis**: 
  - Word-level segmentation and tokenization
  - Phonetic transcription (IPA or simplified phonetics)
  - Contextual translation (meaning within the song context)
- **Specialized Display Format**:
  ```
  [phonetic] [phonetic] [phonetic]
  Original   lyrics    here
  [meaning]  [meaning]  [meaning]
  ```
- **Alignment System**: Precise word-to-annotation mapping
- **Multi-language Support**: Initially focus on popular language pairs

#### Secondary Features
- **Song Library**: Save and organize processed lyrics
- **Learning Progress**: Track vocabulary acquisition
- **Audio Integration**: Optional audio playback synchronization
- **Social Features**: Share processed lyrics with community

### Non-Functional Requirements
- **Performance**: Real-time processing for short verses (<5 seconds)
- **Accuracy**: 95%+ accurate translations and phonetics
- **Responsiveness**: Mobile-first design for singing practice
- **Accessibility**: Screen reader compatible, keyboard navigation

## 🛠️ Technical Solution

### Architecture Overview
```
SvelteKit Full-Stack App
├── Frontend (Svelte Components)
├── API Routes (Server-side)
├── Database (SQLite/PostgreSQL)
└── AI Services Integration
```

### Technology Stack

#### Core Framework
- **Framework**: SvelteKit (Full-stack solution)
- **Runtime**: Node.js with TypeScript
- **Build Tool**: Vite (built-in with SvelteKit)
- **Package Manager**: npm/pnpm
- **Deployment**: Vercel/Netlify (with adapters)

#### Frontend
- **UI Components**: Svelte 5 with runes
- **Styling**: Tailwind CSS + Custom CSS Grid for lyric alignment
- **State Management**: Svelte stores + page data
- **Form Handling**: SvelteKit form actions
- **Real-time Updates**: Server-Sent Events (SSE) or WebSockets

#### Backend (SvelteKit API Routes)
- **API**: SvelteKit server routes (`src/routes/api/`)
- **Database**: 
  - Development: SQLite with better-sqlite3
  - Production: PostgreSQL with pg
- **ORM**: Drizzle ORM (lightweight, TypeScript-first)
- **Caching**: Built-in SvelteKit caching + Redis for production
- **Authentication**: Lucia Auth (SvelteKit-optimized)

#### AI Integration
- **Primary Translation**: OpenAI GPT-4 API
- **Phonetics**: Custom phonetic service with IPA libraries
- **Language Detection**: Browser API + server-side validation
- **Processing**: Server-side in API routes with streaming responses

### Key Technical Challenges & Solutions

#### 1. Word Alignment & Typography
```css
.lyric-line {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  gap: 0.5rem;
  align-items: center;
}

.word-unit {
  display: flex;
  flex-direction: column;
  text-align: center;
  min-width: fit-content;
}
```

#### 2. Multi-language Tokenization
- Language detection using AI or langdetect
- Custom tokenization rules per language family
- Handling of contractions, compound words, and particles

#### 3. SvelteKit API Integration
```typescript
// src/routes/api/analyze/+server.ts
import type { RequestHandler } from './$types';
import { analyzeToLyrics } from '$lib/server/services/ai-service';

export const POST: RequestHandler = async ({ request }) => {
  const { lyrics, sourceLanguage, targetLanguage } = await request.json();
  
  const analysis = await analyzeToLyrics(lyrics, sourceLanguage, targetLanguage);
  
  return new Response(JSON.stringify(analysis), {
    headers: { 'Content-Type': 'application/json' }
  });
};

// Type definition
interface LyricAnalysis {
  word: string;
  phonetic: string;
  translation: string;
  context: string;
  position: { line: number; index: number };
}
```

#### 4. SvelteKit Performance Optimization
- **SSR for First Load**: Server-side render initial page for fast loading
- **Progressive Enhancement**: JavaScript enhances the experience but isn't required
- **Form Actions**: Use SvelteKit form actions for reliable form submission
- **Streaming**: Stream AI responses using SvelteKit's streaming capabilities
- **Caching**: Leverage SvelteKit's built-in caching mechanisms
- **Code Splitting**: Automatic route-based code splitting

#### 5. Offline-First Strategy
```typescript
// src/service-worker.ts
import { build, files, version } from '$service-worker';

// Cache processed lyrics for offline access
const CACHE_NAME = `polyglot-singer-${version}`;
const LYRIC_CACHE = 'lyric-cache-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/analyze',
        '/library',
        ...files // Cache static assets
      ]);
    })
  );
});

// Cache processed lyrics when user saves them
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/lyrics/')) {
    event.respondWith(
      caches.open(LYRIC_CACHE).then((cache) => {
        return cache.match(event.request).then((response) => {
          return response || fetch(event.request).then((fetchResponse) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  }
});

// Background sync for saving progress
self.addEventListener('sync', (event) => {
  if (event.tag === 'save-progress') {
    event.waitUntil(syncProgress());
  }
});
```

**Offline Benefits for Language Learning:**
- **Practice Anywhere**: Users can practice saved lyrics without internet
- **Reduced Data Usage**: Cache lyrics to avoid repeated API calls
- **Better Focus**: No distractions from network issues during practice
- **Consistent Experience**: Same performance regardless of connection quality

### Why SvelteKit for This Project?

#### Key Advantages
1. **Full-Stack Solution**: No need for separate frontend/backend - everything in one codebase
2. **File-based Routing**: Intuitive project structure that scales well
3. **Server-Side Rendering**: Fast initial page loads crucial for mobile users
4. **Progressive Enhancement**: Works without JavaScript, enhanced with it
5. **TypeScript First**: Better developer experience and fewer runtime errors
6. **Built-in Performance**: Automatic code splitting, optimizations, and caching
7. **Streaming & Real-time**: Perfect for AI response streaming
8. **Deployment Flexibility**: Deploy anywhere with adapters

#### Perfect Match for Our Use Case
- **Mobile-First**: SvelteKit's SSR ensures fast loading on mobile devices
- **SEO Friendly**: Server-rendered pages for better discoverability
- **Offline Capable**: Service workers for practicing lyrics without internet
  - Cache processed lyrics for offline practice
  - Background sync for saving progress when connection returns
  - Push notifications for daily practice reminders
- **Real-time AI**: Stream AI responses as they're generated
- **Form Handling**: Robust form actions for reliable lyric submission
- **Type Safety**: End-to-end TypeScript for better code quality

### SvelteKit Best Practices Implementation

#### 1. File-based Routing & Layouts
```typescript
// src/routes/+layout.svelte - Global layout
<script>
  import '$lib/styles/global.css';
  import Navigation from '$lib/components/Navigation.svelte';
</script>

<Navigation />
<main>
  <slot />
</main>

// src/routes/analyze/+page.svelte - Analysis page
<script>
  import { enhance } from '$app/forms';
  import LyricInput from '$lib/components/LyricInput.svelte';
</script>
```

#### 2. Form Actions for Reliable Submission
```typescript
// src/routes/analyze/+page.server.ts
import type { Actions } from './$types';
import { analyzeToLyrics } from '$lib/server/services/ai-service';

export const actions: Actions = {
  analyze: async ({ request }) => {
    const data = await request.formData();
    const lyrics = data.get('lyrics')?.toString();
    
    if (!lyrics) {
      return { error: 'Lyrics are required' };
    }
    
    const analysis = await analyzeToLyrics(lyrics);
    return { success: true, analysis };
  }
};
```

#### 3. Server-side Data Loading
```typescript
// src/routes/library/+page.server.ts
import type { PageServerLoad } from './$types';
import { getUserSavedLyrics } from '$lib/server/database/lyrics';

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;
  const savedLyrics = await getUserSavedLyrics(user.id);
  
  return {
    savedLyrics
  };
};
```

#### 4. TypeScript Integration
```typescript
// src/app.d.ts
import type { User } from '$lib/types/user';

declare global {
  namespace App {
    interface Locals {
      user?: User;
    }
    interface PageData {
      user?: User;
    }
  }
}
```

## 📁 Project Structure (SvelteKit)

```
polyglot-singer/
├── src/
│   ├── routes/                    # File-based routing
│   │   ├── +layout.svelte         # Root layout
│   │   ├── +page.svelte           # Home page
│   │   ├── analyze/
│   │   │   ├── +page.svelte       # Lyric analysis page
│   │   │   ├── +page.server.ts    # Server-side data loading
│   │   │   └── +page.ts           # Client-side data loading
│   │   ├── library/
│   │   │   ├── +page.svelte       # Saved lyrics library
│   │   │   └── +page.server.ts
│   │   ├── api/                   # API routes
│   │   │   ├── analyze/
│   │   │   │   └── +server.ts     # POST /api/analyze
│   │   │   ├── lyrics/
│   │   │   │   ├── +server.ts     # CRUD for lyrics
│   │   │   │   └── [id]/
│   │   │   │       └── +server.ts # GET/PUT/DELETE /api/lyrics/[id]
│   │   │   └── auth/
│   │   │       ├── login/
│   │   │       │   └── +server.ts
│   │   │       └── register/
│   │   │           └── +server.ts
│   │   └── (auth)/                # Route groups for auth pages
│   │       ├── login/
│   │       │   └── +page.svelte
│   │       └── register/
│   │           └── +page.svelte
│   ├── lib/                       # Shared utilities and components
│   │   ├── components/
│   │   │   ├── LyricInput.svelte
│   │   │   ├── LyricDisplay.svelte
│   │   │   ├── WordUnit.svelte
│   │   │   ├── LanguageSelector.svelte
│   │   │   └── ui/                # Reusable UI components
│   │   │       ├── Button.svelte
│   │   │       ├── Card.svelte
│   │   │       └── Loading.svelte
│   │   ├── stores/                # Svelte stores
│   │   │   ├── lyrics.ts
│   │   │   ├── user.ts
│   │   │   └── preferences.ts
│   │   ├── server/                # Server-side utilities
│   │   │   ├── database/
│   │   │   │   ├── schema.ts      # Drizzle schema
│   │   │   │   └── connection.ts
│   │   │   ├── services/
│   │   │   │   ├── ai-service.ts
│   │   │   │   ├── phonetic-service.ts
│   │   │   │   └── auth-service.ts
│   │   │   └── utils/
│   │   │       ├── validation.ts
│   │   │       └── response.ts
│   │   ├── types/                 # TypeScript type definitions
│   │   │   ├── lyric.ts
│   │   │   ├── user.ts
│   │   │   └── api.ts
│   │   └── utils/                 # Client/server shared utilities
│   │       ├── constants.ts
│   │       ├── formatting.ts
│   │       └── validation.ts
│   ├── app.html                   # HTML template
│   ├── app.d.ts                   # App type definitions
│   └── hooks.server.ts            # Server hooks (auth, etc.)
├── static/                        # Static assets
│   ├── favicon.png
│   └── images/
├── tests/                         # Testing
│   ├── unit/
│   └── integration/
├── drizzle/                       # Database migrations
├── package.json
├── svelte.config.js              # SvelteKit configuration
├── vite.config.ts                # Vite configuration
├── tailwind.config.js            # Tailwind CSS config
├── drizzle.config.ts             # Drizzle ORM config
└── .env.example                  # Environment variables template
```

## 🚀 Development Roadmap

### Phase 1: SvelteKit MVP (3-4 weeks)
- [ ] **Project Setup**: Create SvelteKit project with TypeScript, Tailwind CSS
- [ ] **Core UI Components**: LyricInput, LyricDisplay, WordUnit components
- [ ] **API Routes**: `/api/analyze` endpoint for lyric processing
- [ ] **AI Integration**: OpenAI GPT-4 API for contextual translation
- [ ] **Basic Phonetics**: Simple phonetic transcription using IPA libraries
- [ ] **CSS Grid Layout**: Perfect word-to-annotation alignment
- [ ] **Form Actions**: Progressive enhancement for lyric submission
- [ ] **Database Setup**: SQLite with Drizzle ORM for development
- [ ] **Language Support**: English ↔ Chinese/Spanish initial implementation

### Phase 2: Enhancement & Polish (2-3 weeks)
- [ ] **Authentication**: Lucia auth integration with SvelteKit
- [ ] **User Data**: Save and manage personal lyric libraries
- [ ] **SSR Optimization**: Server-side rendering for better performance
- [ ] **Responsive Design**: Mobile-first responsive layout
- [ ] **Error Handling**: Comprehensive error boundaries and user feedback
- [ ] **Loading States**: Skeleton loaders and progress indicators
- [ ] **Caching Strategy**: Cache frequently used translations
- [ ] **Language Detection**: Automatic source language detection
- [ ] **Production Database**: PostgreSQL setup with migrations

### Phase 3: Advanced Features (3-4 weeks)
- [ ] **Real-time Processing**: Streaming responses using SvelteKit SSE
- [ ] **Audio Integration**: Optional audio playback with lyric synchronization
- [ ] **Progress Tracking**: Learning analytics and vocabulary retention
- [ ] **Social Features**: Share processed lyrics with the community
- [ ] **Offline Support**: Service worker for basic offline functionality
- [ ] **Advanced Phonetics**: More accurate IPA transcription
- [ ] **Multiple Languages**: Support for 10+ language pairs
- [ ] **Performance Monitoring**: Analytics and performance tracking

### Technical Milestones

#### Week 1-2: Foundation
```bash
npx sv create polyglot-singer
npx sv add @tailwindcss/typography drizzle lucia
# Core components and basic API routes
```

#### Week 3-4: Core Features
```bash
# AI integration, database schema, form actions
npm run db:generate && npm run db:migrate
# Deploy to Vercel for testing
```

#### Week 5-6: User Experience
```bash
# Authentication, responsive design, error handling
npm run test # Unit and integration tests
```

#### Week 7-9: Advanced Features
```bash
# Real-time features, audio integration, analytics
npm run build && npm run preview
```

## 🎨 Design Principles

### User Experience
- **Minimal Cognitive Load**: Clean, distraction-free interface
- **Immediate Feedback**: Real-time processing and display
- **Flexible Input**: Support paste from various sources
- **Mobile Optimized**: Primary use case is mobile singing practice

### Visual Design
- **Typography First**: Optimized for reading while singing
- **Consistent Alignment**: Perfect vertical alignment of annotations
- **High Contrast**: Readable in various lighting conditions
- **Responsive Spacing**: Adapts to different screen sizes

## 📊 Success Metrics

- **User Engagement**: Average session duration >10 minutes
- **Learning Effectiveness**: User-reported vocabulary retention
- **Technical Performance**: <3s average processing time
- **User Satisfaction**: >4.5/5 user rating

## 🔧 Getting Started

### Option 1: Use the starter template (Recommended)
```bash
# Create new SvelteKit project with our template
npx sv create polyglot-singer --template github:forchain/polyglot-singer-template
cd polyglot-singer

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Option 2: Create from scratch
```bash
# Create new SvelteKit project
npx sv create polyglot-singer
cd polyglot-singer

# Add recommended integrations
npx sv add @tailwindcss/forms @tailwindcss/typography
npx sv add lucia # for authentication
npx sv add drizzle # for database

# Install additional dependencies
npm install openai better-sqlite3 @types/better-sqlite3

# Set up environment variables
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
echo "DATABASE_URL=sqlite:dev.db" >> .env

# Start development server
npm run dev
```

### Development workflow
```bash
# Run database migrations
npm run db:generate && npm run db:migrate

# Run tests
npm run test

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📄 License

MIT License - see LICENSE file for details

---

*Made with ❤️ for language learners and music lovers*
