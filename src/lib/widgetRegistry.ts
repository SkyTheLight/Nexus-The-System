import type { ComponentType } from 'react'

import TodoWidget from '@/components/widgets/Todo'
import GoalsWidget from '@/components/widgets/Goals'
import IdeasWidget from '@/components/widgets/Ideas'
import NotesWidget from '@/components/widgets/Notes'
import MusicWidget from '@/components/widgets/Music'
import CertificatesWidget from '@/components/widgets/Certificates'
import DevWidget from '@/components/widgets/Dev'
import PerformanceWidget from '@/components/widgets/Performance'
import TimelineWidget from '@/components/widgets/Timeline'
import GitHubWidget from '@/components/widgets/GitHub'
import AssignmentWidget from '@/components/widgets/Assignment'
import AIWebsitesWidget from '@/components/widgets/AIWebsites'
import SchoolLinksWidget from '@/components/widgets/SchoolLinks'
import QuickLinksWidget from '@/components/widgets/QuickLinks'
import SiteButtonsWidget from '@/components/widgets/SiteButtons'
import SpotifyNowPlayingWidget from '@/components/widgets/SpotifyNowPlaying'
import AIChatWidget from '@/components/widgets/AIChat'
import CalendarWidget from '@/components/widgets/Calendar'
import LevelWidget from '@/components/widgets/Level'
import DateHighlightWidget from '@/components/widgets/DateHighlight'
import WeatherWidget from '@/components/widgets/Weather'
import ClassScheduleWidget from '@/components/widgets/ClassSchedule'
import CanvasAnnouncements from '@/components/widgets/CanvasAnnouncements'
import ScreenTimeWidget from '@/components/widgets/ScreenTime'

export interface WidgetRegistryEntry {
  id: string
  component: ComponentType
  label: string
  defaultCols: 1 | 2 | 3
  defaultHeight: 'compact' | 'default' | 'tall'
}

export const WIDGET_REGISTRY: WidgetRegistryEntry[] = [
  { id: 'todos', component: TodoWidget, label: 'To-Do', defaultCols: 2, defaultHeight: 'default' },
  { id: 'goals', component: GoalsWidget, label: 'Goals', defaultCols: 2, defaultHeight: 'default' },
  { id: 'ideas', component: IdeasWidget, label: 'App Ideas', defaultCols: 2, defaultHeight: 'default' },
  { id: 'notes', component: NotesWidget, label: 'Notes', defaultCols: 2, defaultHeight: 'default' },
  { id: 'music', component: MusicWidget, label: 'Music', defaultCols: 1, defaultHeight: 'compact' },
  { id: 'certificates', component: CertificatesWidget, label: 'Certificates', defaultCols: 2, defaultHeight: 'default' },
  { id: 'dev', component: DevWidget, label: 'Dev Mode', defaultCols: 2, defaultHeight: 'default' },
  { id: 'performance', component: PerformanceWidget, label: 'Performance', defaultCols: 2, defaultHeight: 'tall' },
  { id: 'timeline', component: TimelineWidget, label: 'Timeline', defaultCols: 3, defaultHeight: 'tall' },
  { id: 'github', component: GitHubWidget, label: 'GitHub', defaultCols: 2, defaultHeight: 'default' },
  { id: 'assignments', component: AssignmentWidget, label: 'Assignments', defaultCols: 2, defaultHeight: 'default' },
  { id: 'ai-websites', component: AIWebsitesWidget, label: 'AI Websites', defaultCols: 1, defaultHeight: 'compact' },
  { id: 'school-links', component: SchoolLinksWidget, label: 'School Links', defaultCols: 1, defaultHeight: 'compact' },
  { id: 'quick-links', component: QuickLinksWidget, label: 'Quick Links', defaultCols: 1, defaultHeight: 'compact' },
  { id: 'site-buttons', component: SiteButtonsWidget, label: 'Site Buttons', defaultCols: 2, defaultHeight: 'compact' },
  { id: 'spotify-now', component: SpotifyNowPlayingWidget, label: 'Spotify', defaultCols: 1, defaultHeight: 'compact' },
  { id: 'ai-chat', component: AIChatWidget, label: 'AI Chat', defaultCols: 2, defaultHeight: 'tall' },
  { id: 'calendar', component: CalendarWidget, label: 'Calendar', defaultCols: 2, defaultHeight: 'default' },
  { id: 'level', component: LevelWidget, label: 'Level', defaultCols: 1, defaultHeight: 'compact' },
  { id: 'date-highlight', component: DateHighlightWidget, label: 'Date Highlight', defaultCols: 1, defaultHeight: 'compact' },
  { id: 'weather', component: WeatherWidget, label: 'Weather', defaultCols: 1, defaultHeight: 'compact' },
  { id: 'class-schedule', component: ClassScheduleWidget, label: 'Class Schedule', defaultCols: 2, defaultHeight: 'default' },
  { id: 'canvas-announcements', component: CanvasAnnouncements, label: 'Canvas Announcements', defaultCols: 2, defaultHeight: 'default' },
  { id: 'screen-time', component: ScreenTimeWidget, label: 'Screen Time', defaultCols: 1, defaultHeight: 'compact' },
]

export const DEFAULT_WIDGET_ORDER = [
  'date-highlight', 'weather', 'level', 'spotify-now', 'screen-time',
  'todos', 'goals', 'calendar', 'assignments', 'class-schedule', 'canvas-announcements',
  'notes', 'github', 'performance', 'timeline',
  'ideas', 'music', 'certificates',
  'quick-links', 'school-links', 'ai-websites', 'site-buttons',
  'dev', 'ai-chat',
]

/** @deprecated Use LAYOUT_STORAGE_KEYS from `@/lib/layout` */
export const STORAGE_KEY = 'adversity-dashboard-layout'
