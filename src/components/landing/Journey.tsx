import { designTokens } from '@/lib/design-tokens'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const steps = [
  {
    title: 'Descoberta guiada',
    subtitle: 'Dias 1-2',
    description: 'Entendemos sua operação, mapeamos objeções e definimos metas claras para o bot.',
  },
  {
    title: 'Treinamento acelerado',
    subtitle: 'Dias 3-7',
    description:
      'Alimentamos a IA com FAQ, catálogos e políticas, refinando linguagem e intenção de forma colaborativa.',
  },
  {
    title: 'Go live supervisionado',
    subtitle: 'Dias 8-12',
    description:
      'Integramos com a Meta, rodamos testes reais e calibramos respostas, tags e alertas.',
  },
  {
    title: 'Evolução contínua',
    subtitle: 'Dia 13+',
    description:
      'Monitoramos métricas, criamos novas intents, ajustamos tom de voz e mantemos suporte próximo.',
  },
]

export function Journey() {
  return (
    <section className="bg-ink-900/90 py-24">
      <div className={cn(designTokens.container.lg, 'space-y-12 px-6')}>
        <div className="space-y-4 text-center">
          <h2 className={designTokens.typography.h2}>Como é a jornada com a Uzz.AI</h2>
          <p className={designTokens.typography.body}>
            Ativamos, treinamos e evoluímos o UzzApp em etapas enxutas para colocar valor em produção
            em dias, não meses.
          </p>
        </div>

        <div className="relative mx-auto max-w-5xl">
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-mint-500/0 via-mint-500/40 to-mint-500/0 md:block" />
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={cn(
                  'relative flex flex-col gap-6 md:flex-row md:items-start md:gap-10',
                  index % 2 === 0 ? 'md:flex-row-reverse' : ''
                )}
              >
                <div className="flex flex-col items-start md:w-48">
                  <span className="inline-flex items-center gap-2 rounded-full border border-mint-500/30 bg-mint-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-mint-200">
                    Etapa {index + 1}
                  </span>
                  <span className="mt-3 text-sm font-semibold text-mint-300">{step.subtitle}</span>
                </div>
                <Card className="flex-1 border border-mint-500/20 bg-surface/85 p-6 text-left shadow-glow">
                  <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm text-foreground/70">{step.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

