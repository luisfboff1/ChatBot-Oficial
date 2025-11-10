import { designTokens } from '@/lib/design-tokens'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const metrics = [
  { value: '72%', label: 'Taxa média de resolução no primeiro contato' },
  { value: '99,2%', label: 'Disponibilidade monitorada do canal' },
  { value: '850 ms', label: 'Latência média P95 por resposta' },
]

export function Metrics() {
  return (
    <section className="bg-ink-900/95 py-20">
      <div className={cn(designTokens.container.lg, 'grid gap-12 px-6 lg:grid-cols-[2fr,1fr]')}>
        <div className="space-y-6">
          <h2 className={designTokens.typography.h2}>Resultados que entregamos</h2>
          <p className={designTokens.typography.body}>
            Monitoramos performance em tempo real para garantir que o WhatsApp gere valor contínuo ao
            negócio.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {metrics.map((item) => (
              <Card
                key={item.label}
                className="border border-mint-500/30 bg-gradient-blue p-6 text-center shadow-glow"
              >
                <span className="text-4xl font-bold text-mint-200">{item.value}</span>
                <p className="mt-2 text-sm text-foreground/70">{item.label}</p>
              </Card>
            ))}
          </div>
        </div>

        <Card className="border border-mint-500/20 bg-surface/80 p-6 shadow-glow">
          <span className="text-5xl leading-none text-mint-300">“</span>
          <p className="mt-4 text-sm text-foreground/70">
            Economizamos 15 horas semanais no atendimento e aumentamos a conversão de leads em 28% com
            o UzzApp.
          </p>
          <div className="mt-6 text-xs font-semibold uppercase tracking-[0.4em] text-mint-300/80">
            Cliente piloto (Academia) • Outubro/2025
          </div>
        </Card>
      </div>
    </section>
  )
}

