'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Keyboard, X } from 'lucide-react'
import { KEYBOARD_SHORTCUTS } from '@/hooks/useKeyboardShortcuts'

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[calc(100vw-2rem)] sm:w-full bg-slate-800 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              <DialogTitle className="text-base sm:text-xl font-semibold">Keyboard Shortcuts</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-full hover:bg-slate-700 touch-manipulation"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription className="text-slate-400 text-xs sm:text-sm">
            Master these shortcuts to boost your productivity
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1 mt-4">
          {KEYBOARD_SHORTCUTS.map(({ key, description }) => (
            <div
              key={key}
              className="flex items-center justify-between py-2 px-2 sm:px-3 rounded-lg hover:bg-slate-700/30 transition-colors gap-2"
            >
              <span className="text-xs sm:text-sm text-slate-300 flex-1">{description}</span>
              <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold bg-slate-700 border border-slate-600 rounded-md text-slate-200 whitespace-nowrap">
                {key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-4 p-2.5 sm:p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-[10px] sm:text-xs text-blue-300">
            💡 <strong>Pro Tip:</strong> Press <kbd className="px-1 sm:px-1.5 py-0.5 bg-slate-700 rounded text-[10px] sm:text-xs">Ctrl+/</kbd> anytime to view this help
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
