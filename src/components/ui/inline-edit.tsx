'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface InlineEditProps {
  value: string
  onSave: (newValue: string) => void
  onCancel?: () => void
  className?: string
  inputClassName?: string
  placeholder?: string
  multiline?: boolean
  autoFocus?: boolean
  selectAll?: boolean
}

export function InlineEdit({
  value,
  onSave,
  onCancel,
  className = '',
  inputClassName = '',
  placeholder = 'Click to edit...',
  multiline = false,
  autoFocus = false,
  selectAll = false,
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!isEditing) {
      setEditValue(value)
    }
  }, [isEditing, value])

  useEffect(() => {
    if (isEditing && inputRef.current && autoFocus) {
      inputRef.current.focus()
      if (selectAll) {
        inputRef.current.select()
      }
    }
  }, [isEditing, autoFocus, selectAll])

  const handleSave = () => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== value) {
      onSave(trimmed)
    } else if (!trimmed) {
      setEditValue(value)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
    onCancel?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  if (!isEditing) {
    return (
      <div
        className={cn('cursor-pointer hover:bg-white/5 rounded px-1 -mx-1 py-0.5 transition-colors', className)}
        onClick={() => setIsEditing(true)}
      >
        <span className={cn('block truncate', !value && 'text-muted-foreground italic', className)}>
          {value || placeholder}
        </span>
      </div>
    )
  }

  const commonProps = {
    value: editValue,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setEditValue(e.target.value),
    onKeyDown: handleKeyDown,
    className: cn(
      'bg-transparent border-none outline-none text-foreground text-sm w-full py-0.5 px-1 -mx-1',
      'focus:bg-white/5 focus:rounded transition-colors',
      inputClassName
    ),
    ref: inputRef as any,
  }

  if (multiline) {
    return (
      <div className="relative">
        <textarea
          {...commonProps}
          rows={3}
          className={cn(commonProps.className, 'resize-none pr-6')}
        />
        <button
          data-cancel-button
          onClick={handleCancel}
          className="absolute top-1 right-1 p-0.5 hover:bg-white/10 rounded transition-colors"
          title="Cancel"
        >
          <X size={12} />
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <input type="text" {...commonProps} className={cn(commonProps.className, 'pr-6')} />
      <button
        data-cancel-button
        onClick={handleCancel}
        className="absolute top-1/2 -translate-y-1/2 right-1 p-0.5 hover:bg-white/10 rounded transition-colors"
        title="Cancel"
      >
        <X size={12} />
      </button>
    </div>
  )
}
