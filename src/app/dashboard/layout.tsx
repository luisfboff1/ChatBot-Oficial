import { MessageSquare, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-gray-50 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            ChatBot
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dashboard WhatsApp
          </p>
        </div>

        <Separator className="mb-6" />

        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="font-medium">Conversas</span>
          </Link>
        </nav>

        <Separator className="my-6" />

        <div className="text-xs text-muted-foreground">
          <p>Versão 1.0.0 - Phase 2</p>
          <p className="mt-1">n8n + Next.js</p>
        </div>
      </aside>

      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
