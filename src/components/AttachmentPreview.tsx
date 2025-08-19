'use client'

import Image from 'next/image'
import { X, Paperclip } from 'lucide-react'

interface AttachmentPreviewProps {
  files: File[]
  onRemove: (index: number) => void
}

export default function AttachmentPreview({ files, onRemove }: AttachmentPreviewProps) {
  if (files.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-2 bg-inherit">
      {files.map((file, idx) => {
        const isImage = file.type.startsWith('image/')
        const isVideo = file.type.startsWith('video/')

        return (
          <div
            key={idx}
            className="relative rounded-md border border-slate-600 bg-slate-700 p-1 max-w-[100px] max-h-[100px] flex items-center justify-center"
          >
            {isImage ? (
              <Image
                src={URL.createObjectURL(file)}
                alt={file.name}
                width={100}
                height={100}
                className="object-cover rounded-md w-full h-full"
              />
            ) : isVideo ? (
              <video
                src={URL.createObjectURL(file)}
                className="rounded-md w-full h-full"
                controls={false}
              />
            ) : (
              <div className="flex items-center text-slate-200 text-xs gap-1 px-2 py-1">
                <Paperclip className="w-4 h-4" />
                <span className="truncate max-w-[60px]">{file.name}</span>
              </div>
            )}
            {/* Remove button */}
            <button
              onClick={() => onRemove(idx)}
              className="absolute top-0 right-0 bg-black/60 rounded-full p-0.5 hover:bg-black/80"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
