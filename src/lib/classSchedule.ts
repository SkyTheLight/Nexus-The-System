export interface TimeSlot {
  day: string
  start: string
  end: string
  room: string
}

export interface ClassInfo {
  code: string
  title: string
  instructor: string
  slots: TimeSlot[]
}

export const CLASSES: ClassInfo[] = [
  {
    code: 'EMC004',
    title: 'Fundamentals of Software Testing',
    instructor: 'Fernandez, Percival',
    slots: [
      { day: 'Mon', start: '6:30 PM', end: '9:00 PM', room: '602 Lab' },
    ],
  },
  {
    code: 'CS401',
    title: 'Dynamic Web Programming',
    instructor: 'Asino, Roberto',
    slots: [
      { day: 'Thu', start: '11:00 AM', end: '1:30 PM', room: '502 Pentab' },
    ],
  },
  {
    code: 'CS323',
    title: 'Knowledge Management',
    instructor: 'Villanueva, Denmor Israel',
    slots: [
      { day: 'Fri', start: '6:30 PM', end: '9:00 PM', room: '302 Mac Lab' },
    ],
  },
  {
    code: 'CS404',
    title: 'Hybrid Programming',
    instructor: 'Fuller, Jonathan',
    slots: [
      { day: 'Sat', start: '1:30 PM', end: '4:00 PM', room: '503 Mac Lab' },
    ],
  },
  {
    code: 'IS324',
    title: 'Digital Marketing',
    instructor: 'Callejo, Raejel Linimer',
    slots: [
      { day: 'Sat', start: '4:00 PM', end: '6:30 PM', room: '601 Lab' },
    ],
  },
  {
    code: 'CS222',
    title: 'Mobile Application Development 2',
    instructor: 'Benoya, Gary June',
    slots: [
      { day: 'Sat', start: '6:30 PM', end: '9:00 PM', room: '603 Mac Lab' },
    ],
  },
]

export const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function getTodayClasses(): ClassInfo[] {
  const today = DAY_ORDER[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
  return CLASSES.filter(c => c.slots.some(s => s.day === today))
}
