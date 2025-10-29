'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { UserProfileSettings } from '@/components/UserProfileSettings'
import { EnvironmentVariables } from '@/components/EnvironmentVariables'

interface SettingsPageClientProps {
  user: User
}

/**
 * Settings Page Client Component
 * 
 * Manages user settings and environment variables
 */
export function SettingsPageClient({ user }: SettingsPageClientProps) {
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie suas informações pessoais e variáveis de ambiente
        </p>
      </div>

      <Separator className="mb-8" />

      {/* User Profile Section */}
      <div className="mb-8">
        <UserProfileSettings user={user} />
      </div>

      {/* Environment Variables Section */}
      <div>
        <EnvironmentVariables />
      </div>
    </div>
  )
}
