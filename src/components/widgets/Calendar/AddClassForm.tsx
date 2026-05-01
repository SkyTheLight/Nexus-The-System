'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'

interface AddClassFormProps {
  onClose: () => void
  onSave: () => void
}

const DAYS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' }
]

export default function AddClassForm({ onClose, onSave }: AddClassFormProps) {
  const [subject, setSubject] = useState('')
  const [dayOfWeek, setDayOfWeek] = useState(1)
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('10:00')
  const [room, setRoom] = useState('')
  const [color, setColor] = useState('#00d4ff')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!subject.trim()) return

    setSaving(true)
    const supabase = getSupabase()

    if (supabase) {
      try {
        const { error } = await supabase
          .from('class_schedule')
          .insert({
            subject,
            day_of_week: dayOfWeek,
            start_time: startTime,
            end_time: endTime,
            room,
            color
          })

        if (!error) {
          onSave()
          onClose()
        }
      } catch (e) {
        console.error('Failed to save class:', e)
      }
    }

    setSaving(false)
  }

  return (
    <div className="mt-3 p-3 bg-[#0B0B0C] border border-[#00d4ff22] rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#00d4ffcc] font-bold">ADD CLASS</span>
        <button onClick={onClose} className="p-0.5 hover:bg-white/5 rounded">
          <X size={10} />
        </button>
      </div>

      <input
        type="text"
        value={subject}
        onChange={e => setSubject(e.target.value)}
        placeholder="Subject name"
        className="w-full px-2 py-1 mb-2 text-xs bg-black border border-[#00d4ff22] rounded text-white font-mono"
      />

      <select
        value={dayOfWeek}
        onChange={e => setDayOfWeek(parseInt(e.target.value))}
        className="w-full px-2 py-1 mb-2 text-xs bg-black border border-[#00d4ff22] rounded text-white font-mono"
      >
        {DAYS.map(d => (
          <option key={d.value} value={d.value}>{d.label}</option>
        ))}
      </select>

      <div className="flex gap-2 mb-2">
        <input
          type="time"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          className="flex-1 px-2 py-1 text-xs bg-black border border-[#00d4ff22] rounded text-white font-mono"
        />
        <input
          type="time"
          value={endTime}
          onChange={e => setEndTime(e.target.value)}
          className="flex-1 px-2 py-1 text-xs bg-black border border-[#00d4ff22] rounded text-white font-mono"
        />
      </div>

      <input
        type="text"
        value={room}
        onChange={e => setRoom(e.target.value)}
        placeholder="Room (optional)"
        className="w-full px-2 py-1 mb-2 text-xs bg-black border border-[#00d4ff22] rounded text-white font-mono"
      />

      <div className="flex gap-2 mb-3">
        {['#00d4ff', '#22c55e', '#a855f7', '#ff6b35', '#fbbf24'].map(c => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-5 h-5 rounded-full ${color === c ? 'ring-2 ring-white' : ''}`}
            style={{ background: c }}
          />
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !subject.trim()}
        className="w-full py-1 bg-[#00d4ff] text-black text-xs font-bold rounded hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saving ? 'SAVING...' : 'SAVE'}
      </button>
    </div>
  )
}
