import { designTokens } from '@/lib/design-tokens'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: 'O UzzApp substitui minha equipe?',
    answer:
      'Não. Ele automatiza o repetitivo, mantém contexto e entrega os casos quentes com resumo, tags e próximos passos para que seu time foque em fechar negócios.',
  },
  {
    question: 'Em quanto tempo posso estar no ar?',
    answer:
      'Até 14 dias após o diagnóstico inicial. Trabalhamos em sprints curtos: diagnóstico, treinamento da IA, Go Live supervisionado e otimização contínua.',
  },
  {
    question: 'Vou perder acesso ao WhatsApp Business?',
    answer:
      'Não. Você mantém o acesso normal e ganha a nossa plataforma web com visão 360º de conversas, métricas e histórico auditável.',
  },
  {
    question: 'Quanto custa?',
    answer:
      'Modelo de setup único + mensalidade. Inclui infraestrutura, monitoramento, evolução contínua da IA e suporte humano. Solicite uma proposta personalizada.',
  },
  {
    question: 'É seguro e está em conformidade com a LGPD?',
    answer:
      'Sim. Utilizamos API oficial Meta, armazenamento seguro com logs auditáveis, controle de acesso e práticas alinhadas à LGPD.',
  },
]

export function FAQ() {
  return (
    <section className="border-t border-border/40 bg-ink-900/95 py-20">
      <div className={cn(designTokens.container.lg, designTokens.spacing.stack, 'px-6')}>
        <div className="space-y-4 text-center">
          <h2 className={designTokens.typography.h2}>Perguntas frequentes</h2>
          <p className={designTokens.typography.body}>
            Transparência total para você entender como operamos, quanto tempo leva e como garantimos
            segurança.
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((item) => (
            <Card key={item.question} className="border border-mint-500/20 bg-surface/80 p-6">
              <h3 className="text-lg font-semibold text-mint-200">{item.question}</h3>
              <p className="mt-3 text-sm text-foreground/70">{item.answer}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

