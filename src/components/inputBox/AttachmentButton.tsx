'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, ImageIcon, Paperclip  } from 'lucide-react'

interface AttachmentButtonProps {
  onSelectFiles?: (files: FileList) => void
  onSelectMedia?: (files: FileList) => void
}

export default function AttachmentButton({
  onSelectFiles,
  onSelectMedia,
}: AttachmentButtonProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const mediaInputRef = useRef<HTMLInputElement | null>(null)

  const handleFilePick = () => fileInputRef.current?.click()
  const handleMediaPick = () => mediaInputRef.current?.click()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="rounded-full p-2 bg-slate-600 hover:bg-slate-500"
          >
            <Plus className="w-5 h-5 text-white" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="z-[10000] bg-slate-800 text-slate-100 border border-slate-700 rounded-lg shadow-lg"
          side="top"
          align="start"
        >
          <DropdownMenuItem
            onClick={handleMediaPick}
            className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Media
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleFilePick}
            className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer"
          >
            <Paperclip  className="w-4 h-4 mr-2" />
            Files
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden inputs */}
      <input
        ref={mediaInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        hidden
        onChange={(e) => e.target.files && onSelectMedia?.(e.target.files)}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        multiple
        hidden
        onChange={(e) => e.target.files && onSelectFiles?.(e.target.files)}
      />
    </>
  )
}
