import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function getDomainKey(host: string | null): string | null {
  if (!host) return null
  const cleaned = host.toLowerCase().replace(/^www\./, '').split(':')[0]
  if (cleaned.endsWith('.vercel.app') || cleaned === 'localhost') return null
  return cleaned
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/r/') ||
    pathname.startsWith('/blocked') ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  const slug = pathname.split('/')[1]
  if (!slug) return NextResponse.next()

  const country = req.headers.get('x-vercel-ip-country') ?? ''
  const domain = getDomainKey(req.headers.get('host'))

  try {
    let url = `${SUPABASE_URL}/rest/v1/creators?slug=eq.${slug}&select=blocked_countries&active=eq.true`
    if (domain) {
      url += `&custom_domain=eq.${encodeURIComponent(domain)}`
    } else {
      url += `&custom_domain=is.null`
    }

    const res = await fetch(url, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    })
    const data = await res.json()
    const creator = data?.[0]

    if (creator?.blocked_countries?.includes(country)) {
      return NextResponse.redirect(new URL('/blocked', req.url))
    }
  } catch {}

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
