import Link from 'next/link'
import { designTokens } from '@/lib/design-tokens'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-20">
      <div className="absolute inset-0 -z-10 bg-gradient-blue opacity-70 blur-[200px]" />
      <div className={cn(designTokens.container.lg, 'relative z-10 space-y-8 px-6 text-center')}>
        <h2 className={designTokens.typography.h2}>
          Pronto para transformar o WhatsApp em um canal de vendas inteligente?
        </h2>
        <p className={designTokens.typography.body}>
          Vamos mostrar, na prática, como o UzzApp personaliza cada conversa e gera novas receitas para
          o seu negócio.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button variant="glow" size="lg" className="rounded-full">
            Agendar demonstração guiada
          </Button>
          <Link
            href="/contato"
            className={cn(buttonVariants({ variant: 'outlineMint', size: 'lg' }), 'rounded-full')}
          >
            Conversar com especialista
          </Link>
        </div>
        <div className="flex items-center justify-center gap-6 text-xs uppercase tracking-[0.4em] text-mint-300/80">
          <span>WhatsApp</span>
          <span>Calendly</span>
          <span>E-mail</span>
        </div>
      </div>
    </section>
  )
}

