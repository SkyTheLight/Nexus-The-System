# Adversity - Personal Command Center

A minimalist, elite-level personal productivity system built with Next.js 14+, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Focus Board** - Command center dashboard
- **To-Do System** - Smart task manager with priorities and filters
- **App Ideas Vault** - Store and track project ideas
- **Goals Tracker** - Short and long-term goal tracking
- **Certificates Tracker** - Monitor certifications and deadlines
- **Notes/Knowledge Base** - Markdown-supported notes
- **Music Playlist** - Curated music for focus
- **Timeline/Roadmap** - Visual progress timeline
- **Dev Mode** - Code snippets and dev notes
- **Performance Mode** - Gaming routines and setups
- **Global Search** - Search across all modules

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL)
- Zustand (State Management)
- Lucide React (Icons)

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Update `.env.local` with your credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. **Run database schema:**
   - Go to your Supabase project SQL Editor
   - Copy and run the contents of `supabase-schema.sql`

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the app:**
   - Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment

Deploy to Vercel:
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables from `.env.local`
4. Deploy

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Focus Board (home)
│   ├── todos/page.tsx
│   ├── ideas/page.tsx
│   ├── goals/page.tsx
│   ├── certificates/page.tsx
│   ├── notes/page.tsx
│   ├── music/page.tsx
│   ├── timeline/page.tsx
│   ├── dev/page.tsx
│   ├── performance/page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/            # Reusable components
│   ├── Sidebar.tsx
│   ├── TopBar.tsx
│   ├── FocusBoard.tsx
│   ├── TodoList.tsx
│   ├── IdeasList.tsx
│   ├── GoalsList.tsx
│   ├── CertificatesList.tsx
│   ├── NotesList.tsx
│   ├── MusicList.tsx
│   ├── TimelineView.tsx
│   ├── DevMode.tsx
│   └── PerformanceMode.tsx
├── lib/                  # Utilities and store
│   ├── supabase.ts
│   └── store.ts
└── types/                # TypeScript types
    └── index.ts
```

## License

MIT
