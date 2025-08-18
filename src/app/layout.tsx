import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ServiceWorkerProvider from './ServiceWorkerProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sidekick',
  description: 'Your AI Sidekick for conversations, code, and productivity.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/favicon-32x32.png',
    shortcut: '/icons/favicon-16x16.png',
    apple: '/icons/apple-touch-icon.png',
  },
  themeColor: '#1e1e1e',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#1e1e1e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.className}>
        <ServiceWorkerProvider />
        {children}
      </body>
    </html>
  )
}
