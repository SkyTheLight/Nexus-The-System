# Adversity Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (about 1-2 minutes)
3. Go to **Settings > API** in your Supabase dashboard
4. Copy the **Project URL** and **anon public** key
5. Update `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### 3. Database Setup

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New Query**
3. Copy the entire contents of `supabase-schema.sql` from this project
4. Click **Run** to create all tables and policies

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables from `.env.local` in Vercel settings
4. Deploy!

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with Sidebar + TopBar
│   ├── page.tsx           # Focus Board (home)
│   ├── globals.css        # Global styles + dark mode
│   └── [page]/page.tsx   # All other pages
├── components/            # React components
│   ├── Sidebar.tsx       # Collapsible navigation
│   ├── TopBar.tsx        # Search + Quick Add button
│   ├── QuickAdd.tsx      # Modal for quick task creation
│   ├── FocusBoard.tsx    # Dashboard with priority items
│   ├── TodoList.tsx      # Task manager
│   ├── IdeasList.tsx     # App ideas vault
│   ├── GoalsList.tsx     # Goal tracker
│   ├── CertificatesList.tsx
│   ├── NotesList.tsx
│   ├── MusicList.tsx
│   ├── TimelineView.tsx
│   ├── DevMode.tsx
│   └── PerformanceMode.tsx
├── lib/
│   ├── supabase.ts       # Supabase client
│   ├── store.ts          # Zustand state management
│   └── api.ts            # CRUD operations for all modules
└── types/
    └── index.ts          # TypeScript interfaces
```

## Features Implemented

- ✅ Dark mode only (true black background)
- ✅ Collapsible sidebar navigation
- ✅ Focus Board dashboard
- ✅ To-Do system with priorities
- ✅ App Ideas vault
- ✅ Goals tracker with progress bars
- ✅ Certificates tracker
- ✅ Notes with search
- ✅ Music playlist
- ✅ Timeline view
- ✅ Dev Mode for code snippets
- ✅ Performance Mode for gaming
- ✅ Quick Add modal
- ✅ Supabase integration ready
- ✅ TypeScript throughout
- ✅ Tailwind CSS styling
- ✅ Responsive layout
- ✅ Vercel-ready

## Next Steps

1. Connect to Supabase by following steps above
2. Replace mock data with real Supabase queries
3. Add create/edit modals for each module
4. Implement global search
5. Add drag-and-drop for tasks (optional)
6. Add keyboard shortcuts (Cmd+K for search, etc.)
