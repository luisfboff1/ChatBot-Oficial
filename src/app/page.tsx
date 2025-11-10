'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Analytics } from '@vercel/analytics/react'
import { useAuth } from '@/contexts/auth-context'
import { Hero } from '@/components/landing/Hero'
import { WhyUs } from '@/components/landing/WhyUs'
import { ProductOverview } from '@/components/landing/ProductOverview'
import { Benefits } from '@/components/landing/Benefits'
import { Metrics } from '@/components/landing/Metrics'
import { Industries } from '@/components/landing/Industries'
import { Journey } from '@/components/landing/Journey'
import { FAQ } from '@/components/landing/FAQ'
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
      <WhyUs />
      <ProductOverview />
      <Benefits />
      <Metrics />
      <Industries />
      <Journey />
      <FAQ />
      <FinalCTA />
    </main>
  )
}
