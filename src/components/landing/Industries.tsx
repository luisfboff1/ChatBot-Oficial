import { designTokens } from '@/lib/design-tokens'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const industries = [
  {
    title: 'Equipes comerciais',
    description:
      'Triagem automática, integração com CRM, follow-ups personalizados e alertas de intenção de compra.',
  },
  {
    title: 'Centrais de atendimento',
    description:
      'Redução de perguntas repetitivas, scripts consistentes, transbordo inteligente e relatórios de SLA.',
  },
  {
    title: 'E-commerces e negócios digitais',
    description:
      'Respostas imediatas, recuperação de carrinhos, ofertas personalizadas e suporte a lançamentos.',
  },
]

export function Industries() {
  return (
    <section className="py-20">
      <div className={cn(designTokens.container.lg, designTokens.spacing.stack, 'px-6')}>
        <div className="space-y-4 text-center">
          <h2 className={designTokens.typography.h2}>Para quem entregamos mais valor</h2>
          <p className={designTokens.typography.body}>
            Ajustamos fluxos, scripts e integrações para diferentes operações comerciais e de suporte.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {industries.map((item) => (
            <Card
              key={item.title}
              className="h-full border border-azure-500/20 bg-surface/85 p-6 text-left shadow-glow"
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

