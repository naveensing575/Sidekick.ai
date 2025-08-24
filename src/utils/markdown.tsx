'use client'

import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { Copy, Check } from 'lucide-react'
import type { ReactNode, ComponentProps } from 'react'
import 'highlight.js/styles/github-dark.css'

function extractText(node: ReactNode): string {
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (React.isValidElement(node)) {
    const el = node as React.ReactElement<{ children?: ReactNode }>
    return el.props.children ? extractText(el.props.children) : ''
  }
  return ''
}


// Separate CodeBlock component to allow hooks
function CodeBlock({ children }: { children: ReactNode }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      const code = extractText(children)
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  return (
    <div className="relative bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto text-sm my-2 max-w-full">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 transition"
      >
        {copied ? (
          <span className="flex items-center gap-1">
            <Check className="w-3 h-3" /> Copied
          </span>
        ) : (
          <span className="flex items-center gap-1 text-gray-200">
            <Copy className="w-3 h-3" /> Copy
          </span>
        )}
      </button>
      <pre>{children}</pre>
    </div>
  )
}

export function Markdown({ content }: { content: string }) {
  return (
    <div className="prose prose-invert dark:prose-invert max-w-full">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
          code: ({
            inline,
            className,
            children,
            ...props
          }: ComponentProps<'code'> & { inline?: boolean }) =>
            inline ? (
              <code
                className="bg-gray-800 text-pink-300 px-1 py-0.5 rounded text-sm"
                {...props}
              >
                {children}
              </code>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
