'use client'
import { Markdown } from '@/utils/markdown'
import { Role } from '@/types/chat'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { User, Sparkles, Check, X, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MessageActions from './MessageActions'
import { Textarea } from '@/components/ui/textarea'

interface MessageBubbleProps {
  id?: string
  role: Role
  content: string
  onEdit?: (messageId: string, newContent: string) => void
  onRegenerate?: () => void
  isLatestUserMessage?: boolean
}

export default function MessageBubble({
  id,
  role,
  content,
  onEdit,
  onRegenerate,
  isLatestUserMessage = false,
}: MessageBubbleProps) {
  const isUser = role === 'user'
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(content)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.selectionStart = editedContent.length
    }
  }, [isEditing, editedContent.length])

  const handleStartEdit = () => {
    setEditedContent(content)
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    if (id && onEdit && editedContent.trim() !== content) {
      onEdit(id, editedContent.trim())
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditedContent(content)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  return (
    <div className={cn('w-full flex gap-3 group', isUser ? 'justify-end' : 'justify-start')}>
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={cn(
          'relative rounded-2xl text-sm shadow-lg',
          isUser
            ? 'max-w-[70%] bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3'
            : 'max-w-[85%] bg-slate-800/70 backdrop-blur-sm border border-slate-700/50 text-white px-4 py-3'
        )}
      >
        {/* Action Buttons */}
        {!isUser && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <MessageActions
              role={role}
              content={content}
              onEdit={undefined}
              onRegenerate={isLatestUserMessage ? onRegenerate : undefined}
              isLatestUserMessage={isLatestUserMessage}
            />
          </div>
        )}

        {/* Edit Button for User Messages */}
        {isUser && !isEditing && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              onClick={handleStartEdit}
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 hover:bg-blue-500/20 border-0"
              aria-label="Edit message"
            >
              <Edit2 className="w-3 h-3 text-white/70 hover:text-white" />
            </Button>
          </div>
        )}

        {/* Message Content or Edit Mode */}
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <Textarea
                ref={textareaRef}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[60px] w-full bg-slate-700/50 border-slate-600 text-white resize-none"
              />
              <div className="flex gap-2 mt-2">
                <Button
                  onClick={handleSaveEdit}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white h-7 px-3"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Save
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  size="sm"
                  variant="ghost"
                  className="hover:bg-slate-700/50 text-slate-300 h-7 px-3"
                >
                  <X className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn('prose prose-sm max-w-none', isUser ? 'prose-invert pr-8' : 'prose-slate prose-invert pr-12')}
            >
              <Markdown content={content} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  )
}
