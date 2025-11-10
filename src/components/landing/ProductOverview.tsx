import Image from 'next/image'
import { designTokens } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

const highlights = [
  {
    title: 'Memory Thread',
    description: 'Guarda histórico completo — texto, áudio e imagem — e recupera em segundos.',
  },
  {
    title: 'Duplo agente IA',
    description:
      'Um responde rápido, outro humaniza, resume e sinaliza o que importa para o time comercial.',
  },
  {
    title: 'Escalonamento inteligente',
    description: 'Transfere para humanos com contexto, próximos passos e insights organizados.',
  },
]

const flow = [
  {
    step: '01',
    title: 'Escuta',
    description: 'Capta o contexto em tempo real e acessa histórico antes de responder.',
  },
  {
    step: '02',
    title: 'Raciocina',
    description:
      'Coordena agentes para entender a intenção, consultar base de conhecimento e montar resposta.',
  },
  {
    step: '03',
    title: 'Entrega & Sinaliza',
    description:
      'Humaniza o tom, responde no estilo da marca e cria alertas para o time agir quando necessário.',
  },
]

export function ProductOverview() {
  return (
    <section className="py-24">
      <div className={cn(designTokens.container.lg, designTokens.spacing.stack, 'px-6')}>
        <div className="grid gap-12 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div className="space-y-6">
            <h2 className={designTokens.typography.h2}>O que é o UzzApp</h2>
            <p className={designTokens.typography.body}>
              UzzApp combina IA avançada com persistência de contexto e supervisão humana. Cada cliente
              é atendido como se fosse único: sem repetições, sem respostas genéricas e sempre com o
              próximo passo preparado.
            </p>
            <Card className="border-mint-500/30 bg-mint-500/5">
              <div className="space-y-4 border-l-4 border-mint-500/80 p-6">
                {highlights.map((item) => (
                  <p key={item.title} className="text-sm text-foreground/80">
                    <span className="font-semibold text-mint-200">{item.title}</span> {item.description}
                  </p>
                ))}
              </div>
            </Card>
          </div>

          <Card className="relative border border-azure-500/20 bg-surface-soft/80">
            <div className="absolute -top-16 right-10 h-32 w-32 rounded-full bg-azure-500/30 blur-3xl" />
            <div className="absolute bottom-8 -left-16 h-40 w-40 rounded-full bg-mint-500/20 blur-3xl" />
            <div className="relative space-y-6 p-8">
              <p className="text-xs uppercase tracking-[0.4em] text-foreground/50">Fluxo inteligente</p>
              <div className="space-y-5">
                {flow.map((item) => (
                  <div
                    key={item.step}
                    className="flex items-start gap-4 rounded-2xl border border-mint-500/15 bg-ink-800/70 p-4"
                  >
                    <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-mint-500/20 text-sm font-semibold text-mint-200">
                      {item.step}
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                      <p className="text-sm text-foreground/70">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-mint-500/10 bg-ink-900/60 p-4 text-sm text-foreground/70">
                <p>
                  Escalamos o atendimento sem perder a voz da marca — sempre com supervisão humana e
                  sinais automáticos quando um lead exige proximidade.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="relative mx-auto aspect-video w-full max-w-4xl overflow-hidden rounded-3xl border border-mint-500/10 bg-surface/80">
          <Image
            src="/images/services/UzzApp.png"
            alt="Ilustração do UzzApp, chatbot empresarial com mascote Uzz.AI"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  )
}

