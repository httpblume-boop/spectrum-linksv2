import { getServiceClient } from './supabase'

// Bestimmt den "Domain-Schlüssel" aus dem Request-Host.
// Default-Vercel-Domains werden als "kein custom domain" behandelt.
export function getDomainKey(host: string | null): string | null {
  if (!host) return null
  const cleaned = host.toLowerCase().replace(/^www\./, '').split(':')[0]
  if (cleaned.endsWith('.vercel.app') || cleaned === 'localhost') return null
  return cleaned
}

// Findet einen Creator passend zur Domain
// - Wenn eine Custom Domain im Request ist → sucht Creator mit dieser custom_domain
// - Sonst → sucht Creator ohne custom_domain (NULL)
export async function findCreator(slug: string, host: string | null) {
  const supabase = getServiceClient()
  const domain = getDomainKey(host)

  if (domain) {
    const { data } = await supabase
      .from('creators')
      .select('*')
      .eq('slug', slug)
      .eq('custom_domain', domain)
      .eq('active', true)
      .single()
    return data
  }

  const { data } = await supabase
    .from('creators')
    .select('*')
    .eq('slug', slug)
    .is('custom_domain', null)
    .eq('active', true)
    .single()
  return data
}
