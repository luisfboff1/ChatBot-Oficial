# User Settings Feature

## Overview

The User Settings feature allows authenticated users to:

1. **Manage User Profile**
   - Update full name
   - Change password
   - View email (read-only)

2. **Manage Environment Variables (Vault)**
   - Edit Meta WhatsApp API credentials
   - Edit OpenAI and Groq API keys
   - View Webhook URL for Meta configuration
   - Password verification required before editing

## Architecture

### Components

```
/dashboard/settings
├── SettingsPageClient.tsx          # Main container (client component)
├── UserProfileSettings.tsx         # Profile editing component
└── EnvironmentVariables.tsx        # Vault secrets management
```

### API Routes

```
/api/settings
├── /profile                        # POST - Update user profile
├── /verify-password                # POST - Verify user password
└── /vault                          # GET/POST - Manage vault secrets
```

### Security Flow

1. **User Profile Updates**
   - Direct API call to `/api/settings/profile`
   - Updates `user_profiles` table and Supabase Auth metadata
   - No additional verification needed (user is already authenticated)

2. **Vault Secrets Access**
   - User must verify password before accessing secrets
   - Password verification via `/api/settings/verify-password`
   - Secrets loaded from Supabase Vault via `/api/settings/vault` GET
   - Secrets updated in Vault via `/api/settings/vault` POST
   - All secrets stored encrypted in `vault.secrets` table

## Vault Integration

### Secret Storage

Secrets are stored in Supabase Vault with AES-256 encryption:

- **Meta Access Token**: `meta_access_token_secret_id` → vault.secrets
- **Meta Verify Token**: `meta_verify_token_secret_id` → vault.secrets
- **Meta Phone Number ID**: Stored directly in `clients.meta_phone_number_id` (not sensitive)
- **OpenAI API Key**: `openai_api_key_secret_id` → vault.secrets
- **Groq API Key**: `groq_api_key_secret_id` → vault.secrets

### Vault Functions

Required PostgreSQL functions (must be created in Supabase SQL Editor):

```sql
-- See migrations/007_vault_functions.sql for complete implementation

create_client_secret(secret_value, secret_name, description) → UUID
get_client_secret(secret_id) → TEXT
update_client_secret(secret_id, new_value) → BOOLEAN
```

## Setup Instructions

### 1. Enable Supabase Vault

1. Go to https://app.supabase.com/project/_/settings/vault
2. Enable Vault if not already enabled
3. Note: Vault is available on all Supabase projects

### 2. Run Vault Functions Migration

Execute `migrations/007_vault_functions.sql` in Supabase SQL Editor:

```bash
# Copy contents of migrations/007_vault_functions.sql
# Paste into Supabase SQL Editor
# Execute
```

### 3. Verify Setup

Test vault functions work:

```sql
-- Test create secret
SELECT create_client_secret('test-value', 'test-secret', 'Test secret');

-- Test read secret (use returned UUID)
SELECT get_client_secret('returned-uuid-here');

-- Test update secret
SELECT update_client_secret('returned-uuid-here', 'new-value');
```

## Usage

### Accessing Settings Page

1. Navigate to `/dashboard/settings`
2. User must be authenticated (middleware enforces this)

### Updating Profile

1. Modify name in "Nome Completo" field
2. Optionally set new password
3. Click "Salvar Alterações"
4. Success toast appears on successful update

### Managing Environment Variables

1. Click "Desbloquear para Editar" button
2. Enter password in verification dialog
3. Click "Verificar" to unlock editing
4. Edit any credentials (all fields are inline editable)
5. Click "Salvar no Vault" to persist changes
6. All secrets are encrypted before storage

### Security Features

- **Password Verification**: Required before viewing/editing vault secrets
- **Masked Display**: Secrets shown as bullets (•••) by default
- **Show/Hide Toggle**: Individual toggle buttons for each secret field
- **Session-Based Access**: Unlock state resets on page reload
- **Encrypted Storage**: All secrets stored with AES-256 encryption

## API Reference

### POST `/api/settings/profile`

Update user profile (name and/or password)

**Request Body:**
```json
{
  "fullName": "New Name",
  "password": "new-password"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

### POST `/api/settings/verify-password`

Verify user password before accessing vault

**Request Body:**
```json
{
  "password": "current-password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password verified successfully"
}
```

### GET `/api/settings/vault`

Get decrypted vault secrets for current user's client

**Response:**
```json
{
  "success": true,
  "data": {
    "metaAccessToken": "EAA...",
    "metaVerifyToken": "verify_token_...",
    "metaPhoneNumberId": "1234567890",
    "webhookUrl": "https://your-app.com/api/webhook/client-id",
    "openaiApiKey": "sk-...",
    "groqApiKey": "gsk_..."
  }
}
```

### POST `/api/settings/vault`

Update vault secrets (create if not exists, update if exists)

**Request Body:**
```json
{
  "metaAccessToken": "new-token",
  "metaVerifyToken": "new-verify-token",
  "metaPhoneNumberId": "new-phone-id",
  "openaiApiKey": "new-openai-key",
  "groqApiKey": "new-groq-key"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vault secrets updated successfully"
}
```

## Database Schema

### Clients Table Extensions

The `clients` table must include these columns for vault secret IDs:

```sql
ALTER TABLE clients ADD COLUMN IF NOT EXISTS meta_access_token_secret_id UUID REFERENCES vault.secrets(id);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS meta_verify_token_secret_id UUID REFERENCES vault.secrets(id);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS openai_api_key_secret_id UUID REFERENCES vault.secrets(id);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS groq_api_key_secret_id UUID REFERENCES vault.secrets(id);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS slug TEXT;
```

## Troubleshooting

### "Function does not exist" Error

**Cause**: Vault functions not created
**Solution**: Run `migrations/007_vault_functions.sql` in Supabase SQL Editor

### "Permission denied for schema vault"

**Cause**: Vault not enabled or incorrect permissions
**Solution**: 
1. Enable Vault in Supabase dashboard
2. Ensure functions use `SECURITY DEFINER`
3. Grant execute permissions to `authenticated` role

### "User profile not configured"

**Cause**: User's `user_profiles` record missing `client_id`
**Solution**: 
1. Check `user_profiles` table has client_id set
2. Ensure user signup triggers create user_profile record

### Secrets not saving

**Cause**: Missing secret_id columns in clients table
**Solution**: Run database migration to add secret_id columns

## Future Enhancements

- [ ] Phone number field (currently not in user_profiles)
- [ ] Email change with verification
- [ ] Two-factor authentication
- [ ] API key usage statistics
- [ ] Secret rotation history
- [ ] Webhook URL testing tool
- [ ] Bulk secret import/export (encrypted)
