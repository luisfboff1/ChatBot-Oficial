import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { AppProviders } from './providers'

export const metadata: Metadata = {
  title: 'ChatBot Dashboard - WhatsApp SaaS',
  description: 'Dashboard para gerenciamento de conversas WhatsApp',
  icons: {
    icon: '/favcon.ico',
    shortcut: '/favcon.ico',
    apple: '/favcon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favcon.ico" />
        <link rel="shortcut icon" href="/favcon.ico" />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  )
}
