import type { Layouts } from 'react-grid-layout'

export const MAIN_DEFAULT_LAYOUTS: Layouts = {
  lg: [
    { i: 'greeting', x: 0, y: 0, w: 5, h: 4, minW: 3, minH: 3 },
    { i: 'holiday', x: 5, y: 0, w: 4, h: 4, minW: 3, minH: 3 },
    { i: 'motivation', x: 9, y: 0, w: 3, h: 4, minW: 2, minH: 3 },
    { i: 'tasks', x: 0, y: 4, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'pinned', x: 4, y: 4, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'classes', x: 8, y: 4, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'ph-news', x: 0, y: 10, w: 12, h: 4, minW: 6, minH: 3 },
  ],
  md: [
    { i: 'greeting', x: 0, y: 0, w: 10, h: 3 },
    { i: 'holiday', x: 0, y: 3, w: 5, h: 4 },
    { i: 'motivation', x: 5, y: 3, w: 5, h: 4 },
    { i: 'tasks', x: 0, y: 7, w: 5, h: 5 },
    { i: 'pinned', x: 5, y: 7, w: 5, h: 5 },
    { i: 'classes', x: 0, y: 12, w: 10, h: 5 },
    { i: 'ph-news', x: 0, y: 17, w: 10, h: 4 },
  ],
  sm: [
    { i: 'greeting', x: 0, y: 0, w: 6, h: 3 },
    { i: 'holiday', x: 0, y: 3, w: 6, h: 4 },
    { i: 'motivation', x: 0, y: 7, w: 6, h: 4 },
    { i: 'tasks', x: 0, y: 11, w: 6, h: 5 },
    { i: 'pinned', x: 0, y: 16, w: 6, h: 5 },
    { i: 'classes', x: 0, y: 21, w: 6, h: 5 },
    { i: 'ph-news', x: 0, y: 26, w: 6, h: 4 },
  ],
  xs: [
    { i: 'greeting', x: 0, y: 0, w: 4, h: 3 },
    { i: 'holiday', x: 0, y: 3, w: 4, h: 4 },
    { i: 'motivation', x: 0, y: 7, w: 4, h: 4 },
    { i: 'tasks', x: 0, y: 11, w: 4, h: 5 },
    { i: 'pinned', x: 0, y: 16, w: 4, h: 5 },
    { i: 'classes', x: 0, y: 21, w: 4, h: 5 },
    { i: 'ph-news', x: 0, y: 26, w: 4, h: 4 },
  ],
  xxs: [
    { i: 'greeting', x: 0, y: 0, w: 2, h: 3 },
    { i: 'holiday', x: 0, y: 3, w: 2, h: 4 },
    { i: 'motivation', x: 0, y: 7, w: 2, h: 4 },
    { i: 'tasks', x: 0, y: 11, w: 2, h: 5 },
    { i: 'pinned', x: 0, y: 16, w: 2, h: 5 },
    { i: 'classes', x: 0, y: 21, w: 2, h: 5 },
    { i: 'ph-news', x: 0, y: 26, w: 2, h: 4 },
  ],
}
