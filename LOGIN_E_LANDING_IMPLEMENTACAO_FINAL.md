# UzzApp — Plano Final de Implementação da Landing Page e Tela de Login

## 1. Propósito do Documento

Este plano consolida tudo o que precisamos para reconstruir a experiência pública do UzzApp, espelhando o nível de maturidade visto no Poker Manager, porém alinhado à identidade retrofuturista da Uzz.AI. Servirá como guia único para:

- Mapear o estado atual do projeto (`src/app` e documentação existente).
- Definir a nova landing page e a tela de login com consistência visual.
- Detalhar arquivos a serem modificados ou criados.
- Fornecer checklists de implantação e validação.

> Referências obrigatórias:
> - `LOGIN_E_LANDING_IMPLEMENTACAO_TECNICA.md` (arquitetura base).
> - `manual-identidade-visual1 com ponto.html` (tipografia, cores, tom).
> - `manual-identidade-visual-backgrounds.html` (gradientes e texturas).

---

## 2. Diagnóstico do Projeto Atual

### 2.1 Estrutura técnica
- Framework: Next.js App Router (`src/app`).
- Autenticação: Supabase (`src/app/(auth)/login/page.tsx`, rotas de API em `src/app/api/auth`).
- Layout global: `src/app/layout.tsx` + `src/app/global.css`.
- Landing atual: marketing em `/servicos/chatbot-empresarial` (componentes mostrados na mensagem do usuário), porém a rota raiz (`src/app/page.tsx`) está focada na aplicação em si (dashboard).

### 2.2 Gaps identificados
- **Landing**: não existe uma home pública dedicada ao produto SaaS; o conteúdo atual fica isolado numa página de serviço.
- **Login**: implementação funcional, mas sem os aprimoramentos do Poker (feedbacks avançados, seleção de tenants, SSO, tracking, tema).
- **Identidade visual**: o dashboard utiliza Tailwind genérico (tons cinza/azul). Não consome a paleta Mint/Black/Silver/Blue/Gold definida no manual.
- **Contexto de autenticação**: disponível, porém necessita convergência com o modelo documentado no Poker para suportar multi-tenant e analytics.

---

## 3. Objetivos da Nova Experiência

1. **Landing Page pública (`/`)**
   - Comunicar claramente valor do UzzApp seguindo o manual de identidade.
   - Reaproveitar seções eficazes do conteúdo existente (hero, pilares, jornadas), traduzindo para o novo design system.
   - Incluir CTAs principais: “Agendar demonstração” e “Conversar com especialista”.
   - Exibir elementos-chave: benefícios, métricas, fluxo multiagente, setores atendidos, FAQ e provas sociais.

2. **Tela de Login (`/login`)**
   - Adotar layout inspirado no Poker, mas com estética Uzz.AI.
   - Fornecer suporte a:
     - Login email/senha com feedbacks claros.
     - SSO futuro (Google/Microsoft) com botões neutros.
     - Aviso de sessão expirada, toggle de senha, links de cadastro/recuperação.
   - Preparar estrutura para seleção de tenants caso necessário.

3. **Consistência visual**
   - Aplicar tokens de design (Mint #1ABC9C, Black #1C1C1C, Silver #B0B0B0, Blue #2E86AB, Gold #FFD700).
   - Usar fontes: Poppins (headlines), Exo 2 (elementos “AI”), Inter (copys), Fira Code (trechos técnicos).
   - Incorporar gradientes do manual (ex.: Mint→Black, Blue→Mint) como backgrounds em seções estratégicas.

---

## 4. Arquitetura e Arquivos Envolvidos

| Área | Arquivo / Diretório | Ação planejada |
|------|---------------------|----------------|
| Layout global | `src/app/layout.tsx`, `src/app/global.css` | Garantir que o tema padrão suporte as cores/gradientes. Pode exigir importação de novos CSS customizados. |
| Landing | `src/app/page.tsx` | Reescrever como landing pública. O conteúdo atual será movido para `/dashboard` (já existente) ou outro path interno caso necessário. |
| Componentização | `src/components/landing/*` (novo) | Criar componentes desacoplados (Hero, Features, Steps, FAQ) para manter o arquivo principal < 200 linhas. |
| Design tokens | `src/lib/design-tokens.ts` (novo) | Derivar do Poker, adaptando cores e tipografia. |
| UI base | `src/components/ui` | Reaproveitar componentes existentes (botão, card) ajustando variantes para a paleta Uzz. |
| Login | `src/app/(auth)/login/page.tsx` | Atualizar com layout dividido (hero lateral + card) adotando tokens e integrações com `useAuth`. |
| Contexto Auth | `src/contexts` ou `src/app/providers` | Revisar `useAuth` para alinhar com fluxos do Poker (gestão de tenants, analytics, SSO). |
| Analytics | `src/lib/analytics.ts` (novo) | Portar tracking minimal (ex.: `trackLogin`) integrado ao Vercel Analytics ou equivalente. |
| Middleware | `middleware.ts` | Ajustar mensagens de sessão expirada (`?expired=true`) e rotas públicas (`/` e `/login`). |

---

## 5. Plano de Implementação (Fases)

### Fase 1 — Preparação de Design System
- [ ] Criar `src/lib/design-tokens.ts` com cores, tipografia e espaçamentos.
- [ ] Revisar `tailwind.config.ts` para incluir novas variáveis (`theme.extend.colors`, gradients, radii).
- [ ] Validar que `ThemeProvider` (se houver) suporta modo dark inspirado nos gradientes (Mint/Black).
- [ ] Atualizar `src/components/ui/button.tsx`, `card.tsx`, etc., para aceitar variantes Uzz (mint, outline neon, premium gold).

### Fase 2 — Refatoração do Contexto de Autenticação
- [ ] Revisar `src/app/(auth)/login/page.tsx` e `useAuth` para alinhar métodos `login`, `loginWithGoogle`, `loginWithMicrosoft`.
- [ ] Implementar tratamento de tenants (se DB suportar) com redirect para `/select-tenant` (criar stub, se não existir).
- [ ] Garantir que `middleware.ts` reconhece `/` e `/login` como rotas públicas.
- [ ] Criar `src/lib/analytics.ts` com chamada `trackLogin()` e instrumentar `@vercel/analytics/next` na landing.

### Fase 3 — Landing Page
- [ ] Reescrever `src/app/page.tsx` como client component (para usar `useAuth` e redirecionar usuário autenticado).
- [ ] Criar subcomponentes em `src/components/landing/`:
  - `Hero.tsx` (com CTA, background `Mint→Black`, imagem do mascote).
  - `WhyUs.tsx` (cards com dores).
  - `HowItWorks.tsx` (flow em 3 etapas com gradiente Blue→Mint).
  - `Benefits.tsx`, `Metrics.tsx`, `Industries.tsx`, `Journey.tsx`, `FAQ.tsx`, `CTA.tsx`.
- [ ] Inserir elementos visuais do manual (badges circulares, gradientes, mascote).
- [ ] Respeitar tipografia (Poppins/Exo 2) e microcopy 24/7.
- [ ] Incluir `Analytics` do Vercel + tracking custom nos CTAs.

### Fase 4 — Tela de Login
- [ ] Atualizar `src/app/(auth)/login/page.tsx` com layout “plasma” adaptado:
  - Header com logo Uzz.AI (Poppins/Exo 2).
  - Lateral esquerda com bullet points (Mint/Gold highlights).
  - Formulário em card translúcido (Black→Blue gradiente).
- [ ] Implementar toggles e mensagens de erro com ícones `lucide-react`.
- [ ] Adicionar links `Cadastre-se`, `Recuperar senha`, `Voltar à landing`.
- [ ] Conectar `trackLogin()` nos fluxos de sucesso.

### Fase 5 — QA e Ajustes Finais
- [ ] `npm run lint` e `npm run typecheck`.
- [ ] Testar fluxos:
  - Anônimo → Landing → Login → Dashboard.
  - Sessão expirada (`?expired=true`) → Banner.
  - Responsividade (320 / 768 / 1440px).
  - Tema escuro/claro (se habilitado).
- [ ] Validar acessibilidade: estrutura semântica, contraste, foco.
- [ ] Revisar copy com identidade “Criador-Sábio” (tom perspicaz, preciso, criativo).

---

## 6. Checklist de Implantação

| Etapa | Tarefas | Status |
|-------|---------|--------|
| **Setup** | Confirmar `.env.local` com `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, etc. | ⬜ |
| **Design System** | Tokens + Tailwind + componentes atualizados | ⬜ |
| **Auth Context** | Métodos unificados, tenants, analytics | ⬜ |
| **Landing** | `src/app/page.tsx` + subcomponentes + assets | ⬜ |
| **Login** | Layout atualizado, feedbacks, tracking | ⬜ |
| **Middleware** | Rotas públicas, banner expiração | ⬜ |
| **QA** | Lint, typecheck, testes manuais | ⬜ |
| **Documentação** | Atualizar `docs/` com instruções de deploy e identidade | ⬜ |

---

## 7. Considerações Sobre Identidade Visual

- **Cores principais:** Mint (#1ABC9C) para CTAs e highlights; Black (#1C1C1C) como base; Silver (#B0B0B0) em textos secundários; Blue (#2E86AB) para reforçar confiança; Gold (#FFD700) somente em destaques premium.
- **Gradientes sugeridos:**
  - Hero landing: `linear-gradient(135deg, #1ABC9C, #031414)`.
  - Seções técnicas: `linear-gradient(160deg, #050912, #1f1440)` com overlays mint/blue.
  - Cards premium: `linear-gradient(135deg, #FFD700, #1C1C1C)`.
- **Tipografia:**
  - Headlines: Poppins (400/600/700).
  - Elementos “AI” e badges: Exo 2 (600).
  - Texto corrido: Inter (400/500).
  - Snippets técnicos: Fira Code (400/500).
- **Mascote Uzz:** usar variações das pétalas/olho conforme manual; aplicar estados (mint padrão, blue processing, gold sucesso) em componentes gráficos.

---

## 8. Próximos Passos Imediatos

1. Validar com stakeholders a arquitetura proposta e aprovar a paleta.
2. Criar branch `feature/landing-login-uzzapp`.
3. Executar Fase 1 (design system) antes de mexer nas páginas.
4. Após cada fase, registrar progresso no README ou docs específicos.
5. Planejar refinamentos de copy/visual em iterações futuras (ex.: animações Framer Motion, assets 3D).

Com este plano, teremos clareza sobre cada alteração necessária, garantindo que a nova landing e a tela de login reflitam o posicionamento premium da Uzz.AI e ofereçam uma jornada coesa desde o primeiro contato até o acesso autenticado.


