'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Analytics } from '@vercel/analytics/react'
import { useAuth } from '@/contexts/auth-context'
import { Hero } from '@/components/landing/Hero'
import { Highlights } from '@/components/landing/Highlights'
import { Plans } from '@/components/landing/Plans'
import { Security } from '@/components/landing/Security'
import { FinalCTA } from '@/components/landing/FinalCTA'

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard')
    }
  }, [loading, user, router])

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <Analytics />
      <Hero />
      <Highlights />
      <Plans />
      <Security />
      <FinalCTA />
    </main>
  )
}
