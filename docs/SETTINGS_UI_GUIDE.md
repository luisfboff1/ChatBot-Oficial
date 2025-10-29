# Settings Page UI Guide

## Overview

This document describes the User Settings page UI and user flows.

## Navigation

**Location**: `/dashboard/settings`

**Access**: Click "Configurações" in the left sidebar navigation (gear icon)

## Page Layout

### Header
```
┌─────────────────────────────────────────────┐
│ Configurações                               │
│ Gerencie suas informações pessoais e        │
│ variáveis de ambiente                       │
└─────────────────────────────────────────────┘
```

### Section 1: User Profile Settings

**Card Title**: "Perfil do Usuário"
**Card Description**: "Atualize suas informações pessoais"

**Fields**:
1. **E-mail** (read-only, gray background)
   - Shows user's email address
   - Note: "O e-mail não pode ser alterado"

2. **Nome Completo** (editable)
   - Text input for full name
   - Placeholder: "Digite seu nome completo"
   - Pre-filled with current user's name if available

3. **Nova Senha** (optional)
   - Password input
   - Placeholder: "Deixe em branco para não alterar"
   - Only required if user wants to change password

4. **Confirmar Nova Senha**
   - Password input
   - Placeholder: "Confirme a nova senha"
   - Disabled if "Nova Senha" is empty
   - Must match "Nova Senha" value

**Actions**:
- "Salvar Alterações" button
- Disabled while saving
- Shows "Salvando..." when in progress

**Visual Layout**:
```
┌──────────────────────────────────────────────┐
│ Perfil do Usuário                            │
│ Atualize suas informações pessoais           │
├──────────────────────────────────────────────┤
│                                              │
│ E-mail                                       │
│ ┌──────────────────────────────────────────┐ │
│ │ user@example.com            [disabled]   │ │
│ └──────────────────────────────────────────┘ │
│ O e-mail não pode ser alterado               │
│                                              │
│ Nome Completo                                │
│ ┌──────────────────────────────────────────┐ │
│ │ João Silva                               │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ──────────────────────────────────────────── │
│                                              │
│ Nova Senha                                   │
│ ┌──────────────────────────────────────────┐ │
│ │ ••••••••                                 │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ Confirmar Nova Senha                         │
│ ┌──────────────────────────────────────────┐ │
│ │ ••••••••                                 │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ [ Salvar Alterações ]                        │
│                                              │
└──────────────────────────────────────────────┘
```

### Section 2: Environment Variables (Vault)

**Card Title**: "🔒 Variáveis de Ambiente"
**Card Description**: "Gerencie as credenciais do cliente armazenadas no Supabase Vault"

#### State 1: Locked (Initial State)

**Visual**:
```
┌──────────────────────────────────────────────┐
│ 🔒 Variáveis de Ambiente                     │
│ Gerencie as credenciais do cliente           │
│ armazenadas no Supabase Vault                │
├──────────────────────────────────────────────┤
│                                              │
│           🔒 [Lock Icon]                     │
│                                              │
│   As variáveis de ambiente estão protegidas  │
│                                              │
│      [ 🔒 Desbloquear para Editar ]          │
│                                              │
└──────────────────────────────────────────────┘
```

#### State 2: Password Verification Dialog

**Triggered by**: Clicking "Desbloquear para Editar"

**Dialog**:
```
┌─────────────────────────────────────┐
│ Verificação de Senha           [×]  │
├─────────────────────────────────────┤
│ Por segurança, confirme sua senha   │
│ para editar as variáveis de         │
│ ambiente                            │
│                                     │
│ Senha                               │
│ ┌─────────────────────────────────┐ │
│ │ ••••••••                        │ │
│ └─────────────────────────────────┘ │
│                                     │
│        [ Cancelar ]  [ Verificar ]  │
└─────────────────────────────────────┘
```

**Keyboard**: Press Enter to verify

#### State 3: Unlocked (After Verification)

**Visual**:
```
┌──────────────────────────────────────────────────────┐
│ 🔒 Variáveis de Ambiente                             │
│ Gerencie as credenciais do cliente                   │
│ armazenadas no Supabase Vault                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Meta Access Token                                    │
│ ┌────────────────────────────────────────┐ ┌──────┐ │
│ │ ••••••••••••••••••••••••••••••••••••• │ │ ��️  │ │
│ └────────────────────────────────────────┘ └──────┘ │
│                                                      │
│ Meta Verify Token                                    │
│ ┌────────────────────────────────────────┐ ┌──────┐ │
│ │ ••••••••••••••••••••••••••••••••••••• │ │ 👁️  │ │
│ └────────────────────────────────────────┘ └──────┘ │
│                                                      │
│ Meta Phone Number ID                                 │
│ ┌────────────────────────────────────────┐          │
│ │ 1234567890                             │          │
│ └────────────────────────────────────────┘          │
│                                                      │
│ Webhook URL (Meta API)                               │
│ ┌────────────────────────────────────────┐          │
│ │ https://app.com/api/webhook/client-id  │ [gray]  │
│ └────────────────────────────────────────┘          │
│ Use esta URL na configuração do Meta Dashboard       │
│                                                      │
│ ────────────────────────────────────────────────── │
│                                                      │
│ OpenAI API Key (opcional)                            │
│ ┌────────────────────────────────────────┐ ┌──────┐ │
│ │ ••••••••••••••••••••••••••••••••••••• │ │ 👁️  │ │
│ └────────────────────────────────────────┘ └──────┘ │
│                                                      │
│ Groq API Key (opcional)                              │
│ ┌────────────────────────────────────────┐ ┌──────┐ │
│ │ ••••••••••••••••••••••••••••••••••••• │ │ 👁️  │ │
│ └────────────────────────────────────────┘ └──────┘ │
│                                                      │
│ [ 💾 Salvar no Vault ]  [ 🔄 Recarregar ]           │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Eye Icons**: Toggle between showing actual value and masked (•••) display

**Webhook URL**: Read-only field displaying the complete webhook URL with client ID

## User Flows

### Flow 1: Update Profile Name

1. User navigates to `/dashboard/settings`
2. Sees "Perfil do Usuário" card
3. Updates "Nome Completo" field
4. Clicks "Salvar Alterações"
5. Success toast: "Perfil atualizado - Suas informações foram salvas com sucesso"
6. Name updates in sidebar immediately

### Flow 2: Change Password

1. User navigates to `/dashboard/settings`
2. Enters new password in "Nova Senha"
3. Enters same password in "Confirmar Nova Senha"
4. Clicks "Salvar Alterações"
5. Success toast: "Perfil atualizado"
6. Password fields cleared automatically

**Error Cases**:
- Password too short (<6 chars): "Senha muito curta - A senha deve ter pelo menos 6 caracteres"
- Passwords don't match: "Senhas não conferem - Por favor, confirme a senha corretamente"

### Flow 3: View Environment Variables

1. User navigates to `/dashboard/settings`
2. Scrolls to "Variáveis de Ambiente" card
3. Sees locked state with "Desbloquear para Editar" button
4. Clicks button
5. Password dialog appears
6. Enters current password
7. Clicks "Verificar" (or presses Enter)
8. Dialog closes
9. Variables load and display (masked)
10. Success toast: "Acesso liberado - Você pode editar as variáveis de ambiente"

**Error Case**:
- Wrong password: "Verificação falhou - Password verification failed"

### Flow 4: Edit Environment Variables

**Prerequisites**: Must be unlocked (Flow 3 completed)

1. User clicks eye icon (👁️) next to a secret field
2. Secret value becomes visible (plaintext)
3. User clicks eye icon again to re-mask
4. User edits any field directly
5. User clicks "Salvar no Vault"
6. Success toast: "Salvo com sucesso - Variáveis de ambiente atualizadas no Vault"
7. All changes persisted to Supabase Vault

**Special Fields**:
- **Webhook URL**: Always read-only, auto-generated based on client ID
- **Meta Phone Number ID**: Not masked (not considered secret)

### Flow 5: Copy Webhook URL for Meta Configuration

1. User unlocks environment variables
2. Locates "Webhook URL (Meta API)" field
3. Selects and copies the URL
4. Pastes into Meta Developer Dashboard webhook configuration
5. Uses Meta Verify Token from settings to complete Meta setup

## Visual States

### Loading State

When loading vault data after password verification:

```
┌──────────────────────────────────────────────┐
│ 🔒 Variáveis de Ambiente                     │
├──────────────────────────────────────────────┤
│                                              │
│           🔄 [Spinning Icon]                 │
│           Carregando...                      │
│                                              │
└──────────────────────────────────────────────┘
```

### Saving State

Button changes during save:

- Normal: `[ 💾 Salvar no Vault ]`
- Saving: `[ 💾 Salvando... ]` (disabled)

### Toasts

Success toasts appear in top-right corner:

```
┌────────────────────────────────┐
│ ✅ Perfil atualizado           │
│ Suas informações foram salvas  │
│ com sucesso                    │
└────────────────────────────────┘
```

Error toasts:

```
┌────────────────────────────────┐
│ ❌ Erro ao salvar              │
│ [Error message here]           │
└────────────────────────────────┘
```

## Responsive Design

- Max width: 4xl (56rem)
- Mobile: Single column, full width
- Desktop: Fixed max-width, centered
- Forms: Full width within cards
- Buttons: Auto width based on content

## Accessibility

- All inputs have associated labels
- Password fields use type="password"
- Disabled fields visually distinct (gray background)
- Toast notifications for screen readers
- Keyboard navigation supported (Tab, Enter)
- Dialog can be closed with Escape key

## Security Features

1. **Password Verification**: Required before accessing sensitive data
2. **Masked Display**: Secrets hidden by default
3. **Session-Based Unlock**: Unlock state doesn't persist across page reloads
4. **HTTPS Only**: All API calls use secure transport
5. **Vault Encryption**: Secrets encrypted at rest with AES-256
6. **No URL Parameters**: No secrets passed in URLs
7. **Server-Side Only**: Vault operations only on server (never in browser)

## Integration Points

### With Dashboard Layout

Settings link appears in sidebar navigation:
- Icon: Settings (gear) icon
- Label: "Configurações"
- Active state when on `/dashboard/settings`

### With Auth System

- Requires authenticated user (middleware enforces)
- Uses user.email for display
- Uses user.user_metadata.full_name for profile
- Password changes through Supabase Auth API

### With Vault System

- Reads from `vault.secrets` table (encrypted)
- Uses helper functions: `getSecret()`, `createSecret()`, `updateSecret()`
- Secret IDs stored in `clients` table columns
- Direct API communication with Supabase Vault
