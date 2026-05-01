'use client'

import { useEffect, useRef } from 'react'
import { getTasks } from '@/lib/api'
import type { Task } from '@/types'

export function useTaskNotifications() {
  const notifiedTasksRef = useRef<Set<string>>(new Set())
  const permissionGrantedRef = useRef(false)

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        permissionGrantedRef.current = permission === 'granted'
      })
    } else if ('Notification' in window && Notification.permission === 'granted') {
      permissionGrantedRef.current = true
    }
  }, [])

  useEffect(() => {
    if (!permissionGrantedRef.current) return

    const checkTasks = async () => {
      try {
        const tasks = await getTasks()
        const now = new Date()

        tasks.forEach((task: Task) => {
          // Skip if already notified
          if (notifiedTasksRef.current.has(task.id)) return

          // Check if task has a deadline
          if (task.deadline) {
            const deadline = new Date(task.deadline)
            const timeDiff = deadline.getTime() - now.getTime()
            const hoursDiff = timeDiff / (1000 * 3600)

            // Notify if task is due within 1 hour or overdue
            if (timeDiff < 0 && task.status !== 'done') {
              // Overdue task
              new Notification('Task Overdue', {
                body: `"${task.title}" is overdue!`,
                icon: '/favicon.ico'
              })
              notifiedTasksRef.current.add(task.id)
            } else if (hoursDiff >= 0 && hoursDiff <= 1 && task.status !== 'done') {
              // Due within 1 hour
              new Notification('Task Due Soon', {
                body: `"${task.title}" is due within an hour!`,
                icon: '/favicon.ico'
              })
              notifiedTasksRef.current.add(task.id)
            }
          }

          // Notify for newly created tasks (created in last 5 seconds)
          if (task.created_at) {
            const createdAt = new Date(task.created_at)
            const timeSinceCreation = now.getTime() - createdAt.getTime()
            if (timeSinceCreation < 5000 && timeSinceCreation > 0 && !notifiedTasksRef.current.has(task.id)) {
              new Notification('New Task Created', {
                body: `"${task.title}" was added to your todo list`,
                icon: '/favicon.ico'
              })
              notifiedTasksRef.current.add(task.id)
            }
          }
        })
      } catch (error) {
        console.error('Failed to check tasks for notifications:', error)
      }
    }

    // Check immediately
    checkTasks()

    // Check every 30 seconds (less frequent than widget polling)
    const interval = setInterval(checkTasks, 30000)

    return () => clearInterval(interval)
  }, [])
}
