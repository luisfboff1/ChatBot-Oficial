import { designTokens } from '@/lib/design-tokens'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const benefits = [
  {
    title: 'Atendimento que nunca dorme',
    description: 'Respostas em segundos, 24/7, no tom da sua marca — sem plantão humano.',
  },
  {
    title: 'Leads quentes para o comercial',
    description: 'Pontuação automática, alertas imediatos e follow-ups preparados para vender.',
  },
  {
    title: 'Multiagente IA',
    description: 'Uma IA conversa, outra garante empatia, consistência e atualização dos sistemas.',
  },
  {
    title: 'Dashboard profissional',
    description: 'Histórico completo, métricas de resolução e gestão de atendentes em um painel.',
  },
]

export function Benefits() {
  return (
    <section className="py-20">
      <div className={cn(designTokens.container.lg, designTokens.spacing.stack, 'px-6')}>
        <div className="space-y-4 text-center">
          <h2 className={designTokens.typography.h2}>Benefícios que geram valor</h2>
          <p className={designTokens.typography.body}>
            Cada funcionalidade do UzzApp foi desenhada para trazer retorno direto ao negócio e aliviar
            sua operação.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {benefits.map((item) => (
            <Card
              key={item.title}
              className="flex h-full flex-col border border-azure-500/20 bg-surface/85 p-6 shadow-glow"
            >
              <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-3 text-sm text-foreground/70">{item.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

