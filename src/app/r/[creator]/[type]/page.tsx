import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { getServiceClient } from '@/lib/supabase'

// Bot-User-Agents die wir nicht durchlassen wollen
const BOT_PATTERNS = [
  /bot/i, /crawl/i, /spider/i, /facebook/i, /meta/i, /instagram.*crawler/i,
  /preview/i, /scraper/i, /linkpreview/i, /whatsapp/i, /telegram/i,
]

export default async function RedirectPage({
  params,
}: {
  params: Promise<{ creator: string; type: string }>
}) {
  const { creator: slug, type } = await params

  const headersList = await headers()
  const ua = headersList.get('user-agent') ?? ''
  const isBot = BOT_PATTERNS.some((pattern) => pattern.test(ua))

  const supabase = getServiceClient()
  const { data: creator } = await supabase
    .from('creators')
    .select('id, of_link')
    .eq('slug', slug)
    .single()

  if (!creator) notFound()

  let url = ''
  if (type === 'of') {
    url = creator.of_link
  } else {
    const { data: link } = await supabase
      .from('links')
      .select('url')
      .eq('creator_id', creator.id)
      .eq('id', type)
      .single()
    url = link?.url ?? ''
  }

  if (!url) notFound()

  // Bots sehen eine harmlose leere Seite — KEIN Redirect zu OF
  if (isBot) {
    return (
      <html>
        <head><title>Loading...</title></head>
        <body>
          <p>Loading...</p>
        </body>
      </html>
    )
  }

  // Echte User: JS-Redirect (Bot kann kein JS ausführen)
  // Track click in fire-and-forget mode
  return (
    <html>
      <head>
        <title>Weiterleitung...</title>
        <meta name="robots" content="noindex,nofollow" />
      </head>
      <body style={{ margin: 0, background: '#000', color: '#fff', fontFamily: 'system-ui' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 32, height: 32, border: '2px solid rgba(255,255,255,0.2)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
        <style dangerouslySetInnerHTML={{ __html: '@keyframes spin{to{transform:rotate(360deg)}}' }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              fetch('/api/track', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({creator_id:'${creator.id}', link_type:'${type === 'of' ? 'of_link' : 'link'}'}), keepalive:true}).catch(()=>{});
              setTimeout(function(){window.location.replace(${JSON.stringify(url)})}, 50);
            `,
          }}
        />
      </body>
    </html>
  )
}
