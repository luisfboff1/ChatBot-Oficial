import { getCurrentUser } from '@/lib/supabase-server'
import { SettingsPageClient } from '@/components/SettingsPageClient'

/**
 * Settings Page - Server Component
 * 
 * Displays user profile settings and environment variables management
 */
export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
        <p className="mt-2 text-muted-foreground">
          Você precisa estar autenticado para acessar esta página.
        </p>
      </div>
    )
  }

  return <SettingsPageClient user={user} />
}
