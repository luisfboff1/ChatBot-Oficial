/**
 * Analytics helpers para eventos críticos do app.
 * Projecta compatibilidade com Vercel Analytics, Umami e GA4.
 */
export const trackUzzEvent = {
  login() {
    if (typeof window === 'undefined') return

    try {
      ;(window as any).va?.track?.('login')
    } catch (error) {
      console.warn('[analytics] Falha ao enviar evento Vercel Analytics:', error)
    }

    try {
      ;(window as any).umami?.track?.('login')
    } catch {
      // Umami opcional
    }

    try {
      ;(window as any).gtag?.('event', 'login', { method: 'password' })
    } catch {
      // Google Analytics opcional
    }
  },
  logout() {
    if (typeof window === 'undefined') return

    try {
      ;(window as any).va?.track?.('logout')
    } catch (error) {
      console.warn('[analytics] Falha ao enviar evento de logout:', error)
    }

    try {
      ;(window as any).gtag?.('event', 'logout')
    } catch {
      // Ignora
    }
  },
}


