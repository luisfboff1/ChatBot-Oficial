import Link from 'next/link'
import { designTokens } from '@/lib/design-tokens'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background py-24">
      <div
        className={cn(
          designTokens.container.lg,
          'relative z-10 flex flex-col items-center gap-10 px-6 text-center'
        )}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-primary">
          Portal UzzApp
        </span>

        <div className="max-w-3xl space-y-6">
          <h1 className={designTokens.typography.hero}>
            Entre no painel UzzApp e acompanhe seus atendimentos em tempo real.
          </h1>
          <p className={designTokens.typography.lead}>
            Acesse o dashboard seguro do seu time, configure fluxos e mantenha o canal WhatsApp sob
            controle com a nossa inteligência multiagente.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link href="/login">
            <Button variant="default" size="lg" className="rounded-full">
              Fazer login
            </Button>
          </Link>
          <Link
            href="/register"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'rounded-full')}
          >
            Criar conta para meu time
          </Link>
        </div>

        <p className="text-sm text-foreground/70">
          Não recebeu o convite? Peça ao administrador para adicioná-lo em <strong>Configurações &gt;
          Usuários</strong>.
        </p>
      </div>
    </section>
  )
}

