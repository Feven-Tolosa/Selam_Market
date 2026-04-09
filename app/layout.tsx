import type { Metadata } from 'next'
import { Geist, Geist_Mono, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import Navbar from '@/components/layout/Navbar'
import { Toaster } from 'react-hot-toast'
import { VendorProvider } from '@/lib/VendorContext'
import ChatOverlay from '@/components/chat/ChatOverlay'

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
      </body>
    </html>
  )
}
