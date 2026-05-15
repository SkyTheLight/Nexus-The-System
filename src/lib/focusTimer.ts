'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface FocusSession {
  date: string
  duration: number
  completed: boolean
}

interface FocusTimerState {
  timeLeft: number
  isRunning: boolean
  isWork: boolean
  sessions: FocusSession[]
  lastTick: number | null
  tick: () => void
  toggle: () => void
  reset: () => void
  setTimeLeft: (t: number) => void
  switchMode: (work: boolean) => void
  saveSession: (duration: number) => void
}

export const WORK_TIME = 25 * 60
export const BREAK_TIME = 5 * 60

export const useFocusTimer = create<FocusTimerState>()(
  persist(
    (set, get) => ({
      timeLeft: WORK_TIME,
      isRunning: false,
      isWork: true,
      sessions: [],
      lastTick: null,

      tick: () => {
        const { timeLeft, isRunning, isWork, lastTick } = get()
        if (!isRunning) return

        const now = Date.now()
        if (lastTick) {
          const elapsed = Math.floor((now - lastTick) / 1000)
          if (elapsed > 0) {
            const newTime = Math.max(0, timeLeft - elapsed)
            if (newTime <= 0) {
              const nextWork = !isWork
              const sessionDuration = isWork ? WORK_TIME - timeLeft + elapsed : BREAK_TIME - timeLeft + elapsed
              set({
                timeLeft: nextWork ? WORK_TIME : BREAK_TIME,
                isWork: nextWork,
                isRunning: false,
                lastTick: now,
                sessions: [
                  ...get().sessions,
                  { date: new Date().toISOString().split('T')[0], duration: sessionDuration, completed: true }
                ]
              })
            } else {
              set({ timeLeft: newTime, lastTick: now })
            }
          }
        } else {
          set({ lastTick: now })
        }
      },

      toggle: () => {
        const { isRunning } = get()
        if (!isRunning) {
          set({ isRunning: true, lastTick: Date.now() })
        } else {
          set({ isRunning: false, lastTick: null })
        }
      },

      reset: () => {
        set({
          timeLeft: WORK_TIME,
          isRunning: false,
          isWork: true,
          lastTick: null
        })
      },

      setTimeLeft: (t: number) => set({ timeLeft: t }),
      switchMode: (work: boolean) => {
        set({
          isWork: work,
          timeLeft: work ? WORK_TIME : BREAK_TIME,
          isRunning: false,
          lastTick: null
        })
      },

      saveSession: (duration: number) => {
        set({
          sessions: [
            ...get().sessions,
            { date: new Date().toISOString().split('T')[0], duration, completed: true }
          ]
        })
      }
    }),
    {
      name: 'focus-timer-storage',
      partialize: (state) => ({
        timeLeft: state.timeLeft,
        isWork: state.isWork,
        sessions: state.sessions,
        isRunning: false,
        lastTick: null,
      })
    }
  )
)
