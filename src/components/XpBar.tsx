'use client';

import { useXp } from '@/hooks/useXp';
import { useEffect, useState } from 'react';

export default function XpBar() {
  const { totalXp, level, progress, xpForNextLevel } = useXp();
  const [prevLevel, setPrevLevel] = useState(level);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    if (level > prevLevel) {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 1000);
      setPrevLevel(level);
    }
  }, [level, prevLevel]);

  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm mb-2">
        <span className={`${glitch ? 'animate-pulse' : ''} font-medium ${glitch ? 'text-purple-400' : ''}`}>
          Level {level}
        </span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.7)] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
