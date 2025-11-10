import { designTokens } from '@/lib/design-tokens'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const reasons = [
  {
    title: 'Leads perdidos à noite e fins de semana',
    description:
      'Sem resposta imediata, a concorrência fecha o negócio primeiro. Seu canal precisa trabalhar 24/7.',
  },
  {
    title: 'Equipes sobrecarregadas',
    description:
      'Atendentes repetem as mesmas respostas o dia inteiro, gerando custo alto e desgaste do time.',
  },
  {
    title: 'Chatbots genéricos afastam clientes',
    description:
      'Sem memória e personalização, cada conversa soa robótica. O cliente desiste antes de converter.',
  },
]

export function WhyUs() {
  return (
    <section className="py-20">
      <div className={cn(designTokens.container.lg, designTokens.spacing.stack, 'px-6')}>
        <div className="space-y-4 text-center">
          <h2 className={designTokens.typography.h2}>Por que as empresas nos procuram</h2>
          <p className={designTokens.typography.body}>
            O UzzApp une escala, memória e atendimento humano em um único fluxo para que cada contato
            seja uma oportunidade aproveitada.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {reasons.map((item) => (
            <Card key={item.title} className="h-full border border-mint-500/20 bg-surface/90">
              <div className="space-y-3 p-6 text-left">
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-foreground/70">{item.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

