'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Eye, EyeOff, Lock, Save, RefreshCw } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface VaultData {
  metaAccessToken: string
  metaVerifyToken: string
  metaPhoneNumberId: string
  webhookUrl: string
  openaiApiKey: string
  groqApiKey: string
}

/**
 * Environment Variables Component
 * 
 * Manages client credentials from Supabase Vault:
 * - Meta Access Token
 * - Meta Verify Token  
 * - Meta Phone Number ID
 * - Webhook URL (read-only)
 * - OpenAI API Key
 * - Groq API Key
 * 
 * Requires password verification before editing
 */
export function EnvironmentVariables() {
  const { toast } = useToast()
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [password, setPassword] = useState('')
  const [verifyingPassword, setVerifyingPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Show/hide individual fields
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({
    metaAccessToken: false,
    metaVerifyToken: false,
    openaiApiKey: false,
    groqApiKey: false,
  })

  // Vault data
  const [vaultData, setVaultData] = useState<VaultData>({
    metaAccessToken: '',
    metaVerifyToken: '',
    metaPhoneNumberId: '',
    webhookUrl: '',
    openaiApiKey: '',
    groqApiKey: '',
  })

  // Load vault data
  const loadVaultData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings/vault')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao carregar dados')
      }

      setVaultData(result.data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast({
        title: 'Erro ao carregar',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Verify password
  const handleVerifyPassword = async () => {
    try {
      setVerifyingPassword(true)

      const response = await fetch('/api/settings/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Senha incorreta')
      }

      // Password verified - unlock editing
      setIsUnlocked(true)
      setShowPasswordDialog(false)
      setPassword('')
      
      // Load vault data
      await loadVaultData()

      toast({
        title: 'Acesso liberado',
        description: 'Você pode editar as variáveis de ambiente',
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast({
        title: 'Verificação falhou',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setVerifyingPassword(false)
    }
  }

  // Save vault data
  const handleSave = async () => {
    try {
      setSaving(true)

      const response = await fetch('/api/settings/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vaultData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao salvar')
      }

      toast({
        title: 'Salvo com sucesso',
        description: 'Variáveis de ambiente atualizadas no Vault',
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast({
        title: 'Erro ao salvar',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Toggle show/hide token
  const toggleShowToken = (field: string) => {
    setShowTokens((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  // Render masked value
  const renderValue = (field: keyof typeof showTokens, value: string) => {
    if (!value) return ''
    if (showTokens[field]) return value
    return '•'.repeat(Math.min(value.length, 40))
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Variáveis de Ambiente
          </CardTitle>
          <CardDescription>
            Gerencie as credenciais do cliente armazenadas no Supabase Vault
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isUnlocked ? (
            // Locked state - show unlock button
            <div className="text-center py-8">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                As variáveis de ambiente estão protegidas
              </p>
              <Button onClick={() => setShowPasswordDialog(true)}>
                <Lock className="h-4 w-4 mr-2" />
                Desbloquear para Editar
              </Button>
            </div>
          ) : (
            // Unlocked state - show fields
            <>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Carregando...</p>
                </div>
              ) : (
                <>
                  {/* Meta Access Token */}
                  <div className="space-y-2">
                    <Label htmlFor="metaAccessToken">Meta Access Token</Label>
                    <div className="flex gap-2">
                      <Input
                        id="metaAccessToken"
                        type={showTokens.metaAccessToken ? 'text' : 'password'}
                        value={vaultData.metaAccessToken}
                        onChange={(e) => setVaultData({ ...vaultData, metaAccessToken: e.target.value })}
                        placeholder="EAA..."
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => toggleShowToken('metaAccessToken')}
                      >
                        {showTokens.metaAccessToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Meta Verify Token */}
                  <div className="space-y-2">
                    <Label htmlFor="metaVerifyToken">Meta Verify Token</Label>
                    <div className="flex gap-2">
                      <Input
                        id="metaVerifyToken"
                        type={showTokens.metaVerifyToken ? 'text' : 'password'}
                        value={vaultData.metaVerifyToken}
                        onChange={(e) => setVaultData({ ...vaultData, metaVerifyToken: e.target.value })}
                        placeholder="verify_token_..."
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => toggleShowToken('metaVerifyToken')}
                      >
                        {showTokens.metaVerifyToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Meta Phone Number ID */}
                  <div className="space-y-2">
                    <Label htmlFor="metaPhoneNumberId">Meta Phone Number ID</Label>
                    <Input
                      id="metaPhoneNumberId"
                      type="text"
                      value={vaultData.metaPhoneNumberId}
                      onChange={(e) => setVaultData({ ...vaultData, metaPhoneNumberId: e.target.value })}
                      placeholder="1234567890"
                    />
                  </div>

                  {/* Webhook URL (read-only) */}
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">Webhook URL (Meta API)</Label>
                    <Input
                      id="webhookUrl"
                      type="text"
                      value={vaultData.webhookUrl}
                      disabled
                      className="bg-gray-50 font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use esta URL na configuração do Meta Dashboard
                    </p>
                  </div>

                  <Separator className="my-4" />

                  {/* OpenAI API Key */}
                  <div className="space-y-2">
                    <Label htmlFor="openaiApiKey">OpenAI API Key (opcional)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="openaiApiKey"
                        type={showTokens.openaiApiKey ? 'text' : 'password'}
                        value={vaultData.openaiApiKey}
                        onChange={(e) => setVaultData({ ...vaultData, openaiApiKey: e.target.value })}
                        placeholder="sk-..."
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => toggleShowToken('openaiApiKey')}
                      >
                        {showTokens.openaiApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Groq API Key */}
                  <div className="space-y-2">
                    <Label htmlFor="groqApiKey">Groq API Key (opcional)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="groqApiKey"
                        type={showTokens.groqApiKey ? 'text' : 'password'}
                        value={vaultData.groqApiKey}
                        onChange={(e) => setVaultData({ ...vaultData, groqApiKey: e.target.value })}
                        placeholder="gsk_..."
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => toggleShowToken('groqApiKey')}
                      >
                        {showTokens.groqApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-4 flex gap-2">
                    <Button onClick={handleSave} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Salvando...' : 'Salvar no Vault'}
                    </Button>
                    <Button variant="outline" onClick={loadVaultData} disabled={loading}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Recarregar
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Password Verification Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verificação de Senha</DialogTitle>
            <DialogDescription>
              Por segurança, confirme sua senha para editar as variáveis de ambiente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleVerifyPassword()
                  }
                }}
                placeholder="Digite sua senha"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false)
                setPassword('')
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleVerifyPassword} disabled={verifyingPassword || !password}>
              {verifyingPassword ? 'Verificando...' : 'Verificar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
