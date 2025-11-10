# Poker Manager — Documentação Técnica da Landing Page e Login

## 1. Visão Geral

O Poker Manager é um SaaS multi-tenant construído com **Next.js 15**, **React 19** e **Supabase Auth**. A landing page (`app/page.tsx`) serve como porta de entrada pública, enquanto a página de login (`app/login/page.tsx`) autentica usuários com email/senha e provedores OAuth (Google e Microsoft). Ambas operam sobre a infraestrutura de **App Router**, com suporte a **Server Components**, **middleware de autenticação**, **contexto global de usuário** e **design tokens** centralizados.

Este documento descreve, em profundidade, como cada página é estruturada, os componentes de suporte envolvidos e como replicar a implementação em outro projeto (ex.: o chatbot em `src/app`). O objetivo é fornecer um passo a passo completo que permitirá portar a experiência visual e funcional para o novo contexto, preservando os fluxos de autenticação e os padrões de segurança.

---

## 2. Stack e Arquitetura Relevante

| Camada | Responsabilidades | Arquivos-chave |
|--------|-------------------|----------------|
| **UI (App Router)** | Landing e login com animações, layouts responsivos, navegação segura e theming. | `app/page.tsx`, `app/login/page.tsx`, `app/layout.tsx` |
| **Contexto de Autenticação** | Carrega sessão Supabase, expõe métodos de login/logout, controla multi-tenant. | `contexts/auth-context.tsx`, `lib/supabaseClient.ts`, `lib/supabaseServer.ts` |
| **Middleware** | Força autenticação em rotas protegidas, trata redirect de sessão expirada. | `middleware.ts` |
| **Design System** | Tokens globais, componentes shadcn/ui, Tailwind 4, suporte a temas. | `lib/design-tokens.ts`, `components/ui/*`, `components/theme-toggle.tsx` |
| **Analytics** | Eventos (“login”, “signup”), Vercel Analytics, rastreamento customizado. | `lib/analytics.ts`, `app/page.tsx` (hook `Analytics`) |

---

## 3. Landing Page (`app/page.tsx`)

### 3.1 Papel da página
- Exibe a proposta de valor do SaaS antes do login.
- Redireciona automaticamente usuários autenticados para `/dashboard`.
- Apresenta CTAs para “Login” e “Cadastro”, planos de preços, diferenciais e seção final de conversão.

### 3.2 Fluxo de execução
1. **Carregamento inicial:** componente client-side (`'use client'`) para acessar `useRouter` e `useAuth`.
2. **Estado de sessão:** `useAuth()` retorna `{ isAuthenticated, loading }`. Enquanto `loading` estiver `true` a página mostra spinner de carregamento.
3. **Redirecionamento:** `useEffect` observa `isAuthenticated`. Se verdadeiro, `router.push('/dashboard')`.
4. **Renderização:** Se usuário não autenticado, renderiza blocos:
   - Cabeçalho sticky com `ThemeToggle` e CTAs.
   - Hero com animações `framer-motion`, badges, buttons (`buttonVariants`).
   - Seção de planos (cards com `Card`, `Badge`, `Check`), repetindo array `plans`.
   - Seção de recursos (grid com ícones `lucide-react`).
   - CTA final e footer.
5. **Analytics:** `@vercel/analytics/next` injeta coleta automática.

### 3.3 Dependências específicas
- **Design tokens:** `designTokens` padroniza espaçamentos, tipografia, gradientes.
- **Componentes shadcn/ui:** `Badge`, `Card`, `buttonVariants`.
- **Animações:** `motion` do `framer-motion` com variantes `fadeInUp`.
- **Ícones:** `lucide-react`.
- **Tema:** `ThemeToggle` alterna entre dark/light via context global.

### 3.4 Acessibilidade e UX
- Layout mobile-first com container responsivo.
- Feedback visual em CTAs (hover/transition).
- Separadores (`Separator`) criam ritmo visual.
- Copy orientada a benefícios + prova social (“1000+ sessões”).

---

## 4. Página de Login (`app/login/page.tsx`)

### 4.1 Objetivo
Autenticar usuários utilizando:
- Email + senha via `useAuth().login`.
- Login social Google (`loginWithGoogle`) e Microsoft (`loginWithMicrosoft`).
- Gerenciar usuários multi-tenant (redireciona para `/select-tenant` quando aplicável).

### 4.2 Estrutura do componente
```tsx
'use client';
const { login, loginWithGoogle, loginWithMicrosoft, user, loading: authLoading } = useAuth();
const [formData, setFormData] = useState({ email: '', password: '' });
const [showPassword, setShowPassword] = useState(false);
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
```

### 4.3 Principais fluxos
1. **Redirect pré-login:** `useEffect` – se `user` existe, decide rota:
   - Usuário com múltiplos tenants → `/select-tenant`.
   - Caso contrário → `/dashboard`.
2. **Aviso de sessão expirada:** segundo `useEffect` lê `?expired=true` na URL e mostra banner amarelo.
3. **Submit do formulário:** chama `login(formData)`, aciona `trackPokerEvent.login()`, captura erros amigáveis.
4. **SSO Buttons:** chamam `loginWithGoogle()` ou `loginWithMicrosoft()`. Ambos compartilham spinner de estado `loading`.
5. **UX adicional:**
   - Toggle de visibilidade da senha (`Eye`/`EyeOff`).
   - Links para “Cadastre-se” e “Recuperar acesso”.
   - Feedbacks visuais usando `Card`, `AlertCircle` e cores Tailwind custom.

### 4.4 Interações com Auth Context
- `useAuth()` vem de `contexts/auth-context.tsx`, que:
  - Inicializa Supabase client-side (`supabase.auth.onAuthStateChange`).
  - Carrega tenants do usuário (`lib/supabaseClient.ts` + chamadas REST).
  - Expõe métodos: `login`, `logout`, `loginWithGoogle`, `loginWithMicrosoft`, `refreshSession`.
  - Armazena estado global (`user`, `session`, `tenants`, `loading`).

### 4.5 Segurança e RLS
- **Middleware (`middleware.ts`):**
  - Protege rotas `/dashboard`, `/admin`, `/api` sensíveis.
  - Redireciona clientes não autenticados para `/login`.
  - Verifica sessões expiradas e acrescenta query `?expired=true`.
- **Supabase Auth:** tokens de 1 hora, refresh de 30 dias, MFA disponível.
- **Row Level Security:** garante isolamento por tenant (`poker` schema).

---

## 5. Recursos Suporte (Arquivos Complementares)

| Arquivo | Função |
|---------|--------|
| `contexts/auth-context.tsx` | Hook `useAuth`, provider global, carregamento assíncrono, persistência multi-tenant. |
| `lib/supabaseClient.ts` | Instância Supabase client-side, com fallback para URL de placeholder em build. |
| `lib/supabaseServer.ts` | Factory de client Supabase para ambientes server/edge. |
| `lib/analytics.ts` | Funções de rastreamento (ex.: `trackPokerEvent.login()`). |
| `components/theme-toggle.tsx` | Alternância de tema com `next-themes`. |
| `components/ui/*` | Buttons, inputs, cards, labels (com tokens e classes padronizadas). |
| `middleware.ts` | Gatekeeper de rotas protegidas, sincroniza cookie `sb-access-token`. |

---

## 6. Variáveis de Ambiente e Configuração

Adicionar ao `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://jhodhxvvhohygijqcxbo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role>
NEXT_PUBLIC_GA_MEASUREMENT_ID=<opcional-analytics>
```

Outros pontos:
- OAuth configurado no Supabase com redirect URIs:
  - Desenvolvimento: `http://localhost:3000/api/auth/callback`
  - Produção: `https://poker.luisfboff.com/api/auth/callback`
- `next.config.ts` habilita experimental features (App Router) e define domínios confiáveis para imagens.

---

## 7. Testes Recomendados

1. **Fluxo anônimo → Login → Dashboard:** garantir redirect sem loops.
2. **Session expirada:** acessar rota protegida com token expirado → verificar banner e retorno ao login.
3. **Multi-tenant:** usuário com 2+ tenants → confirmar envio para `/select-tenant`.
4. **OAuth Google/Microsoft:** clicar nos botões, completar fluxo e retornar autenticado.
5. **Responsividade:** validar hero, cards e formulário em 320 px / 768 px / 1440 px.
6. **Tema:** alternar claro/escuro e checar persistência.

---

## 8. Adaptação para o Projeto Chatbot (`src/app`)

### 8.1 Diagnóstico do estado atual
- Login do chatbot está em `src/app/(auth)/login/page.tsx`.
  - Usa `signInWithEmail` direto (sem contexto global rico).
  - Não oferece SSO, toggle de senha, tenant selection ou analytics.
- Landing pública inexistente ou simplificada; foco direto no formulário de login.
- Middleware e contexto de autenticação possuem diferenças (ver `src/app/dashboard/layout.tsx` que força login via efeito).

### 8.2 Plano de migração — Passo a passo

1. **Preparação de Design System:**
   - Copiar `components/ui`, `lib/design-tokens.ts`, `components/theme-toggle.tsx`, `lib/utils.ts` necessários.
   - Ajustar `tailwind.config.ts` do chatbot com tokens, cores e `shadcn/ui`.

2. **Contexto de Autenticação:**
   - Integrar `contexts/auth-context.tsx` e `useAuth` ao chatbot (ou alinhar API atual).
   - Garantir que Supabase client/server compartilhem configurações (`lib/supabaseClient.ts`, `lib/supabaseServer.ts`).
   - Implementar `tenants`, `loginWithGoogle`, `loginWithMicrosoft`, `trackPokerEvent`.

3. **Middleware e Proteção de Rotas:**
   - Adaptar `POKERv4-main/middleware.ts` para o domínio do chatbot (ajustando lista de rotas públicas).
   - Incluir tratamento `?expired=true` para fornecer feedback ao usuário.

4. **Landing Page:**
   - Criar `src/app/page.tsx` inspirado em `POKERv4-main/app/page.tsx`.
   - Atualizar copy, planos e ícones conforme identidade do chatbot.
   - Reaproveitar seções (Hero, Pricing, Features, CTA) adaptando para serviços de chatbot.

5. **Página de Login:**
   - Substituir implementação atual por versão portável:
     - Importar `Card`, `Input`, `Button`, `Label`, etc.
     - Replicar estados (`showPassword`, banners de erro/expiração).
     - Conectar-se ao novo `useAuth`.
     - Adicionar botões OAuth (caso chatbot use provedores).
   - Garantir redirect condicional baseado em tenants (se aplicável).

6. **Eventos e Analytics:**
   - Implementar `lib/analytics.ts` no chatbot para rastrear login/signup.
   - Integrar com Vercel Analytics ou ferramenta equivalente.

7. **Ambiente e Configuração:**
   - Confirmar variáveis `.env.local` com URLs do projeto chatbot.
   - Configurar redirecionamentos OAuth na instância Supabase correspondente.

8. **Testes de Integração:**
   - Rodar `npm run dev` e validar fluxos descritos na seção 7.
   - Ajustar mensagens e identidade visual após confirmação funcional.

### 8.3 Considerações para Identidade Visual
- Atualizar cores primárias em `designTokens` e Tailwind.
- Trocar ícones `lucide-react` por ícones de chatbot (ex.: `MessageCircle`, `Robot`).
- Personalizar textos (“Poker Manager” → “Chatbot Manager” etc.).
- Manter estrutura responsiva e acessível como base.

---

## 9. Próximos Passos sugeridos

1. **Migrar contexto de autenticação para o chatbot**, garantindo equivalência de métodos.
2. **Portar landing e login**, ajustando copy e branding do chatbot.
3. **Adicionar comentários inline** ao migrar código para manter documentação viva (seguir guideline do projeto).
4. **Validar multi-tenant**: se o chatbot também usar `user_tenants`, reutilizar a lógica de seleção.
5. **Refinar UX** com identidade visual do chatbot (cores, ilustrações, badges personalizados).

Com essas etapas, o projeto do chatbot poderá replicar uma experiência de onboarding e autenticação robusta, segura e visualmente consistente com o Poker Manager, servindo de base para iterações futuras de branding e funcionalidades.


