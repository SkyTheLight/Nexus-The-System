import { useState, useEffect, useCallback } from 'react';

const XP_KEY = 'adversity-xp';
const XP_EVENT = 'adversity-xp-change';

export function useXp() {
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(XP_KEY);
    if (saved) setTotalXp(parseInt(saved) || 0);

    const handler = (e: CustomEvent) => {
      if (e.detail !== undefined) setTotalXp(e.detail);
    };
    window.addEventListener(XP_EVENT, handler as EventListener);
    return () => window.removeEventListener(XP_EVENT, handler as EventListener);
  }, []);

  const addXp = useCallback((amount: number) => {
    setTotalXp(prev => {
      const newXp = prev + amount;
      localStorage.setItem(XP_KEY, newXp.toString());
      window.dispatchEvent(new CustomEvent(XP_EVENT, { detail: newXp }));
      return newXp;
    });
  }, []);

  const level = Math.floor(Math.sqrt(totalXp) / 10);
  const xpForNextLevel = Math.pow((level + 1) * 10, 2);
  const progress = xpForNextLevel > 0 ? (totalXp / xpForNextLevel) * 100 : 0;

  return { totalXp, level, addXp, progress: Math.min(100, progress), xpForNextLevel };
}

// Global function to add XP from anywhere
export function addXpGlobal(amount: number) {
  const saved = localStorage.getItem(XP_KEY);
  const current = parseInt(saved || '0') || 0;
  const newXp = current + amount;
  localStorage.setItem(XP_KEY, newXp.toString());
  window.dispatchEvent(new CustomEvent(XP_EVENT, { detail: newXp }));
}
