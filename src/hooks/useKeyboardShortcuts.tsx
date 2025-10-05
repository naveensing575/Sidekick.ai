'use client'

import { useEffect, useCallback } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  description: string
  action: () => void
}

interface UseKeyboardShortcutsOptions {
  onNewChat?: () => void
  onSearch?: () => void
  onHelp?: () => void
  onNextChat?: () => void
  onPrevChat?: () => void
  onSwitchToChat?: (index: number) => void
  onFocusInput?: () => void
  onEscape?: () => void
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions) {
  const {
    onNewChat,
    onSearch,
    onHelp,
    onNextChat,
    onPrevChat,
    onSwitchToChat,
    onFocusInput,
    onEscape,
  } = options

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      const target = e.target as HTMLElement
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'

      // Ctrl+N - New Chat
      if (e.ctrlKey && e.key === 'n' && !e.shiftKey && !e.altKey) {
        e.preventDefault()
        onNewChat?.()
        return
      }

      // Ctrl+K - Search/Command Palette
      if (e.ctrlKey && e.key === 'k' && !e.shiftKey && !e.altKey) {
        e.preventDefault()
        onSearch?.()
        return
      }

      // Ctrl+/ - Help
      if (e.ctrlKey && e.key === '/' && !e.shiftKey && !e.altKey) {
        e.preventDefault()
        onHelp?.()
        return
      }

      // Only handle the following if NOT in input
      if (isInput) return

      // Escape - Unfocus/Close
      if (e.key === 'Escape') {
        e.preventDefault()
        onEscape?.()
        return
      }

      // / - Focus input (like Slack/Discord)
      if (e.key === '/' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        e.preventDefault()
        onFocusInput?.()
        return
      }

      // Arrow Down - Next Chat
      if (e.key === 'ArrowDown' && e.altKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault()
        onNextChat?.()
        return
      }

      // Arrow Up - Previous Chat
      if (e.key === 'ArrowUp' && e.altKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault()
        onPrevChat?.()
        return
      }

      // Ctrl+1 through Ctrl+9 - Switch to specific chat
      if (e.ctrlKey && !e.shiftKey && !e.altKey && /^[1-9]$/.test(e.key)) {
        e.preventDefault()
        const index = parseInt(e.key) - 1
        onSwitchToChat?.(index)
        return
      }
    },
    [onNewChat, onSearch, onHelp, onNextChat, onPrevChat, onSwitchToChat, onFocusInput, onEscape]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

export const KEYBOARD_SHORTCUTS = [
  { key: 'Ctrl+N', description: 'New chat' },
  { key: 'Ctrl+K', description: 'Search chats' },
  { key: 'Ctrl+/', description: 'Keyboard shortcuts help' },
  { key: '/', description: 'Focus message input' },
  { key: 'Escape', description: 'Unfocus input / Close dialogs' },
  { key: 'Alt+↓', description: 'Next chat' },
  { key: 'Alt+↑', description: 'Previous chat' },
  { key: 'Ctrl+1-9', description: 'Switch to chat 1-9' },
]
