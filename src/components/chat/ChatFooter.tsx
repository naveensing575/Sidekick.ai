'use client'

import InputBox from '@/components/inputBox/InputBox'

type ChatFooterProps = {
  activeChatId: string | null
  onSubmit: (text: string) => void
  onAbort: () => void
  loading: boolean
  inputRef: React.RefObject<HTMLTextAreaElement | null>
  attachments: File[]
  setAttachments: React.Dispatch<React.SetStateAction<File[]>>
}

export default function ChatFooter({
  activeChatId,
  onSubmit,
  onAbort,
  loading,
  inputRef,
  attachments,
  setAttachments,
}: ChatFooterProps) {
  if (!activeChatId) return null

  return (
    <>
      {/* Mobile fixed footer */}
      <div className="fixed bottom-0 left-0 w-full z-50 md:hidden px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)]">
        <div className="max-w-3xl mx-auto w-full">
          <InputBox
            onSubmit={onSubmit}
            onAbort={onAbort}
            loading={loading}
            ref={inputRef}
            attachments={attachments}
            setAttachments={setAttachments}
          />
        </div>
      </div>

      {/* Desktop inline footer */}
      <div className="hidden md:block px-6 pb-6">
        <div className="max-w-3xl mx-auto w-full">
          <InputBox
            onSubmit={onSubmit}
            onAbort={onAbort}
            loading={loading}
            ref={inputRef}
            attachments={attachments}
            setAttachments={setAttachments}
          />
        </div>
      </div>
    </>
  )
}
