import { Hero } from '@/components/landing/Hero'
import { Highlights } from '@/components/landing/Highlights'
import { Plans } from '@/components/landing/Plans'
import { Security } from '@/components/landing/Security'
import { FinalCTA } from '@/components/landing/FinalCTA'

/**
 * Landing Page - UzzApp
 * 
 * Página pública de apresentação do produto SaaS de chatbot WhatsApp.
 * Apresenta os principais benefícios, planos e segurança do sistema.
 */
export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <Hero />
      <Highlights />
      <Plans />
      <Security />
      <FinalCTA />
    </main>
  )
}
