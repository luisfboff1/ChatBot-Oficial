import Link from 'next/link'
import { ArrowRight, Shield, Zap, Users } from 'lucide-react'
import { designTokens } from '@/lib/design-tokens'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const trustBadges = [
  { icon: Shield, label: 'Segurança total' },
  { icon: Zap, label: 'Ativação em dias' },
  { icon: Users, label: 'Escala humana 24/7' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-24">
      <div className="absolute inset-0 -z-10 bg-gradient-mint opacity-60 blur-[160px]" />
      <div className={cn(designTokens.container.lg, 'relative z-10 px-6')}>
        <div className="mx-auto flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-mint-500/40 bg-mint-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-mint-300">
              Projeto crítico
            </span>
            <h1 className={designTokens.typography.hero}>
              UzzApp — atendimento 24/7 que pensa como a sua equipe e responde como o seu melhor
              vendedor.
            </h1>
            <p className={designTokens.typography.lead}>
              Transforme o WhatsApp da sua empresa em uma central inteligente que nunca perde
              contexto, qualifica leads automaticamente e mantém experiências humanas em cada
              mensagem.
            </p>
            <ul className="space-y-3 text-sm text-foreground/80">
              {[
                'Conversas naturais com memória e histórico completo.',
                'Qualificação e priorização automática de oportunidades.',
                'Integração oficial com o WhatsApp Business API da Meta.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-mint-500/15 text-xs font-semibold text-mint-300">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button variant="glow" className="group">
                Agendar demonstração
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Link
                href="/contato"
                className={cn(
                  buttonVariants({ variant: 'outlineMint', size: 'lg' }),
                  'rounded-full'
                )}
              >
                Conversar com especialista
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md rounded-[36px] border border-mint-500/20 bg-surface/80 p-6 shadow-glow backdrop-blur">
            <div className="absolute -inset-8 rounded-[36px] bg-azure-500/20 blur-3xl" />
            <div className="relative space-y-6 rounded-[28px] border border-mint-500/20 bg-ink-800/80 p-8">
              <p className="text-xs uppercase tracking-[0.4em] text-foreground/50">Fluxo UzzApp</p>
              <div className="space-y-4">
                {[
                  {
                    step: '01',
                    title: 'Escuta',
                    description:
                      'Capta o contexto em tempo real e acessa histórico do cliente antes de responder.',
                  },
                  {
                    step: '02',
                    title: 'Raciocina',
                    description:
                      'Coordena agentes para entender intenção, consultar base e construir respostas.',
                  },
                  {
                    step: '03',
                    title: 'Entrega & Sinaliza',
                    description:
                      'Humaniza, responde no tom da marca e cria alertas para seu time atuar.',
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="flex items-start gap-4 rounded-2xl border border-mint-500/10 bg-surface-soft/80 p-4"
                  >
                    <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-mint-500/15 text-sm font-semibold text-mint-200">
                      {item.step}
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                      <p className="text-sm text-foreground/70">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-xs uppercase tracking-[0.4em] text-mint-300/80">
          {trustBadges.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-mint-300" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

