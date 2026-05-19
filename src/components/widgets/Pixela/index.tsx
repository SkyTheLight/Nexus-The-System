'use client'

import { useState } from 'react'
import { Flame, Plus, Settings, Trash2, BarChart3, Eye, EyeOff } from 'lucide-react'
import { usePixela } from './usePixela'
import type { PixelaConfig } from './usePixela'

export default function PixelaWidget() {
  const { config, stats, loading, error, configOpen, setConfigOpen, saveConfig, clearConfig, increment, incrementing } = usePixela()
  const [showToken, setShowToken] = useState(false)
  const [form, setForm] = useState<PixelaConfig>({ username: '', graphId: '', token: '' })

  if (!config) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">HABIT TRACKER</h3>
          <button onClick={() => setConfigOpen(true)} className="p-1 hover:bg-white/5 rounded transition-colors">
            <Settings size={14} />
          </button>
        </div>
        {configOpen && (
          <ConfigForm
            form={form}
            setForm={setForm}
            onSave={() => saveConfig(form)}
            onCancel={() => setConfigOpen(false)}
            showToken={showToken}
            setShowToken={setShowToken}
          />
        )}
        {!configOpen && (
          <div className="flex-1 flex items-center justify-center">
            <button onClick={() => setConfigOpen(true)} className="text-xs text-[#00d4ff88] hover:text-[#00d4ff] transition-colors">
              + Configure Pixela
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">HABIT TRACKER</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setConfigOpen(!configOpen)} className="p-1 hover:bg-white/5 rounded transition-colors">
            <Settings size={14} />
          </button>
        </div>
      </div>

      {configOpen && (
        <div className="mb-3 p-3 bg-[#0B0B0C] border border-[#a855f722] rounded-lg space-y-2">
          <div className="text-[10px] text-[#a855f788]">Configured: {config.username}/{config.graphId}</div>
          <button onClick={clearConfig} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors">
            <Trash2 size={12} /> Clear config
          </button>
        </div>
      )}

      {loading && <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">LOADING...</div>}
      {error && <div className="flex-1 flex items-center justify-center text-xs text-red-400">{error}</div>}

      {!loading && !error && stats && (
        <>
          {/* Graph */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-2">
            <img
              src={`https://pixe.la/v1/users/${config.username}/graphs/${config.graphId}?mode=short`}
              alt="Pixela graph"
              className="w-full max-w-[240px] h-auto"
              style={{ imageRendering: 'pixelated' }}
            />

            {/* Stats row */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1 text-[#a855f7]">
                <BarChart3 size={12} /> {stats.totalPixels}
              </div>
              <div className="flex items-center gap-1 text-[#22c55e]">
                <Flame size={12} /> {stats.streak}d
              </div>
            </div>

            {/* Increment button */}
            <button
              onClick={increment}
              disabled={incrementing}
              className="flex items-center gap-1 px-4 py-1.5 bg-[#a855f7] text-black text-xs font-bold rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Plus size={14} /> {incrementing ? '...' : 'LOG TODAY'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function ConfigForm({
  form, setForm, onSave, onCancel, showToken, setShowToken,
}: {
  form: PixelaConfig
  setForm: (f: PixelaConfig) => void
  onSave: () => void
  onCancel: () => void
  showToken: boolean
  setShowToken: (v: boolean) => void
}) {
  return (
    <div className="mb-3 p-3 bg-[#0B0B0C] border border-[#a855f722] rounded-lg space-y-2">
      <input
        type="text"
        value={form.username}
        onChange={e => setForm({ ...form, username: e.target.value })}
        placeholder="Pixela username"
        className="w-full px-2 py-1 text-xs bg-black border border-[#a855f722] rounded text-white font-mono"
      />
      <input
        type="text"
        value={form.graphId}
        onChange={e => setForm({ ...form, graphId: e.target.value })}
        placeholder="Graph ID"
        className="w-full px-2 py-1 text-xs bg-black border border-[#a855f722] rounded text-white font-mono"
      />
      <div className="flex gap-2">
        <input
          type={showToken ? 'text' : 'password'}
          value={form.token}
          onChange={e => setForm({ ...form, token: e.target.value })}
          placeholder="X-USER-TOKEN"
          className="flex-1 px-2 py-1 text-xs bg-black border border-[#a855f722] rounded text-white font-mono"
        />
        <button onClick={() => setShowToken(!showToken)} className="p-1 hover:bg-white/5 rounded">
          {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      <div className="flex gap-2">
        <button onClick={onSave} className="flex-1 py-1 bg-[#a855f7] text-black text-xs font-bold rounded hover:opacity-90 transition-opacity">
          SAVE
        </button>
        <button onClick={onCancel} className="px-3 py-1 bg-white/5 text-xs rounded hover:bg-white/10 transition-colors">
          CANCEL
        </button>
      </div>
    </div>
  )
}
