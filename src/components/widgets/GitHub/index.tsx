'use client';

import { useQuery } from '@tanstack/react-query';
import { Github } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Commit {
  message: string;
  repo: string;
  time: string;
  url: string;
}

export default function GitHubWidget() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['github-events'],
    queryFn: async () => {
      const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME;
      const res = await fetch(`https://api.github.com/users/${username}/events`);
      return res.json();
    },
  });

  if (isLoading) return <div className="h-full bg-[#0B0B0C] border border-white/10 rounded-2xl p-6">Loading...</div>;

  const commits: Commit[] = events?.filter((e: any) => e.type === 'PushEvent')
    ?.flatMap((e: any) =>
      e.payload.commits?.map((c: any) => ({
        message: c.message,
        repo: e.repo.name,
        time: formatDistanceToNow(new Date(e.created_at), { addSuffix: true }),
        url: c.url.replace('api.github.com/repos', 'github.com').replace('/commits/', '/commit/'),
      })) || []
    )
    ?.slice(0, 5) || [];

  return (
    <div className="h-full flex flex-col bg-[#0B0B0C] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Github className="w-5 h-5" />
        <h3 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          GitHub Activity
        </h3>
      </div>
      <div className="space-y-3">
        {commits.length === 0 && (
          <p className="text-sm text-gray-400">No recent commits found</p>
        )}
        {commits.map((commit, i) => (
          <a
            key={i}
            href={commit.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:bg-white/5 p-2 rounded-lg transition-colors"
          >
            <p className="text-sm text-gray-200 line-clamp-1">{commit.message}</p>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{commit.repo}</span>
              <span>{commit.time}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
