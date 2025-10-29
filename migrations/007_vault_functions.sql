-- =====================================================
-- Supabase Vault Functions for Multi-Tenant Secrets
-- =====================================================
-- These functions must be created in Supabase SQL Editor
-- They manage encrypted secrets in the vault.secrets table
--
-- IMPORTANT: Run this after enabling Supabase Vault in your project
-- Dashboard: https://app.supabase.com/project/_/settings/vault
-- =====================================================

-- =====================================================
-- FUNCTION: create_client_secret
-- =====================================================
-- Creates a new encrypted secret in Supabase Vault
-- Returns the secret_id (UUID) for storage in clients table
--
-- Example usage:
--   SELECT create_client_secret('my-secret-value', 'my-secret-name', 'Optional description');

CREATE OR REPLACE FUNCTION create_client_secret(
  secret_value TEXT,
  secret_name TEXT,
  secret_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_secret_id UUID;
BEGIN
  -- Insert into vault.secrets (Supabase Vault table)
  -- The vault automatically encrypts the secret value
  INSERT INTO vault.secrets (name, secret, description)
  VALUES (secret_name, secret_value, secret_description)
  RETURNING id INTO new_secret_id;

  RETURN new_secret_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_client_secret(TEXT, TEXT, TEXT) TO authenticated;

-- =====================================================
-- FUNCTION: get_client_secret
-- =====================================================
-- Retrieves and decrypts a secret from Supabase Vault
-- Returns the decrypted secret value
--
-- Example usage:
--   SELECT get_client_secret('550e8400-e29b-41d4-a716-446655440000');

CREATE OR REPLACE FUNCTION get_client_secret(
  secret_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  secret_value TEXT;
BEGIN
  -- Read from vault.decrypted_secrets (Supabase Vault view)
  -- This view automatically decrypts the secret
  SELECT decrypted_secret INTO secret_value
  FROM vault.decrypted_secrets
  WHERE id = secret_id;

  RETURN secret_value;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_client_secret(UUID) TO authenticated;

-- =====================================================
-- FUNCTION: update_client_secret
-- =====================================================
-- Updates an existing secret in Supabase Vault
-- Re-encrypts the secret with the new value
--
-- Example usage:
--   SELECT update_client_secret('550e8400-e29b-41d4-a716-446655440000', 'new-secret-value');

CREATE OR REPLACE FUNCTION update_client_secret(
  secret_id UUID,
  new_secret_value TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the secret in vault.secrets
  -- The vault automatically re-encrypts the new value
  UPDATE vault.secrets
  SET secret = new_secret_value,
      updated_at = NOW()
  WHERE id = secret_id;

  -- Return true if update succeeded
  RETURN FOUND;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_client_secret(UUID, TEXT) TO authenticated;

-- =====================================================
-- FUNCTION: delete_client_secret (optional)
-- =====================================================
-- Deletes a secret from Supabase Vault
-- Use with caution - this is permanent!
--
-- Example usage:
--   SELECT delete_client_secret('550e8400-e29b-41d4-a716-446655440000');

CREATE OR REPLACE FUNCTION delete_client_secret(
  secret_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete the secret from vault.secrets
  DELETE FROM vault.secrets
  WHERE id = secret_id;

  -- Return true if delete succeeded
  RETURN FOUND;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_client_secret(UUID) TO authenticated;

-- =====================================================
-- NOTES
-- =====================================================
-- 1. These functions use SECURITY DEFINER to run with elevated privileges
-- 2. The vault.secrets table is managed by Supabase and automatically encrypts data
-- 3. The vault.decrypted_secrets view provides automatic decryption
-- 4. Always use these functions instead of direct vault table access
-- 5. Secret IDs (UUIDs) are stored in the clients table columns:
--    - meta_access_token_secret_id
--    - meta_verify_token_secret_id
--    - openai_api_key_secret_id
--    - groq_api_key_secret_id
-- 6. SECURITY: The API layer enforces that users can only access secrets
--    belonging to their own client_id. The functions themselves are granted
--    to 'authenticated' role for flexibility, but the application logic
--    (getClientIdFromSession) ensures proper tenant isolation.
-- =====================================================
