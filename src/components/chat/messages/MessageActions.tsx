'use client'

import { Button } from '@/components/ui/button'
import { Edit2, RefreshCw, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { Role } from '@/types/chat'

interface MessageActionsProps {
  role: Role
  content: string
  onEdit?: () => void
  onRegenerate?: () => void
  isLatestUserMessage?: boolean
}

export default function MessageActions({
  role,
  content,
  onEdit,
  onRegenerate,
  isLatestUserMessage = false,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {/* Copy button for all messages */}
      <Button
        onClick={handleCopy}
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0 hover:bg-slate-700/50 border-0"
        aria-label="Copy message"
      >
        {copied ? (
          <Check className="w-3 h-3 text-green-400" />
        ) : (
          <Copy className="w-3 h-3 text-slate-400 hover:text-white" />
        )}
      </Button>

      {/* Edit button for user messages */}
      {role === 'user' && onEdit && (
        <Button
          onClick={onEdit}
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 hover:bg-slate-700/50 border-0"
          aria-label="Edit message"
        >
          <Edit2 className="w-3 h-3 text-slate-400 hover:text-white" />
        </Button>
      )}

      {/* Regenerate button for assistant messages (only if it's the latest) */}
      {role === 'assistant' && isLatestUserMessage && onRegenerate && (
        <Button
          onClick={onRegenerate}
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 hover:bg-slate-700/50 border-0"
          aria-label="Regenerate response"
        >
          <RefreshCw className="w-3 h-3 text-slate-400 hover:text-white" />
        </Button>
      )}
    </div>
  )
}
