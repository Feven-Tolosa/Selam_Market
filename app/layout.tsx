import type { Metadata } from 'next'
import { Geist, Geist_Mono, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import Navbar from '@/components/layout/Navbar'
import { Toaster } from 'react-hot-toast'
import { VendorProvider } from '@/lib/VendorContext'
import ChatOverlay from '@/components/chat/ChatOverlay'
import Script from 'next/script'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Selam Marketplace',
  description:
    'A modern marketplace for Ethiopian products, connecting local vendors with customers worldwide.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang='en'
      className={cn('font-mono', jetbrainsMono.variable)}
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <VendorProvider>
          <Navbar />
          {children}
          <Toaster />
          <ChatOverlay />
        </VendorProvider>
        <Script id='chatling-config' strategy='beforeInteractive'>
          {`
    window.chtlConfig = {
      chatbotId: "4254945597"
    };
  `}
        </Script>

        {/* Chatling embed */}
        <Script
          id='chatling-script'
          src='https://chatling.ai/js/embed.js'
          strategy='afterInteractive'
        />
      </body>
    </html>
  )
}
