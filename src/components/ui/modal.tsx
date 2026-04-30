'use client'

import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#0B0B0C] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/5 rounded-lg transition-all hover:scale-110 active:scale-95"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}

// Standard input styles matching the FIRST design
export const modalInputClass =
  'w-full px-3 py-2.5 bg-[#111113] border border-white/10 rounded-lg text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all'

export const modalTextareaClass =
  'w-full px-3 py-2.5 bg-[#111113] border border-white/10 rounded-lg text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all resize-none min-h-[100px]'

export const modalLabelClass = 'block text-xs font-medium text-muted-foreground'

export const cancelButtonClass =
  'flex-1 px-4 py-2.5 border border-white/10 rounded-lg text-sm text-muted-foreground hover:bg-white/5 transition-all'

export const submitButtonClass =
  'flex-1 px-4 py-2.5 bg-white/80 text-black rounded-lg text-sm font-medium hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed'
