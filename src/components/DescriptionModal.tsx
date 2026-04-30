'use client'

import { X } from 'lucide-react'

interface DescriptionModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  type?: string
  status?: string
  extra?: { label: string; value: string }[]
}

export default function DescriptionModal({ isOpen, onClose, title, description, type, status, extra }: DescriptionModalProps) {
  if (!isOpen) return null

  const getStatusColor = (status: string) => {
    if (status?.includes('completed') || status?.includes('done')) return 'bg-green-500/10 text-green-500'
    if (status?.includes('progress') || status?.includes('studying')) return 'bg-yellow-500/10 text-yellow-400'
    return 'bg-accent text-muted-foreground'
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#0B0B0C] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-scale-in space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {type && (
              <span className="text-xs text-muted-foreground mt-1">{type}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/5 rounded-lg transition-all hover:scale-110 active:scale-95"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {status && (
          <span className={`inline-block text-xs px-2 py-1 rounded ${getStatusColor(status)}`}>
            {status}
          </span>
        )}

        {description ? (
          <div className="bg-[#111113] border border-white/10 rounded-lg p-4">
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{description}</p>
          </div>
        ) : (
          <div className="bg-[#111113] border border-white/10 rounded-lg p-4">
            <p className="text-sm text-muted-foreground italic">No description provided</p>
          </div>
        )}

        {extra && extra.length > 0 && (
          <div className="space-y-2">
            {extra.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="text-gray-300">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full px-4 py-2.5 border border-white/10 rounded-lg text-sm text-muted-foreground hover:bg-white/5 transition-all"
        >
          Close
        </button>
      </div>
    </div>
  )
}
