import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Nur Creator-Pages prüfen (z.B. /marina) — Admin und API ausschließen
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/blocked') ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  const slug = pathname.split('/')[1]
  if (!slug) return NextResponse.next()

  // Land aus Vercel Geo Header
  const country = req.headers.get('x-vercel-ip-country') ?? ''

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/creators?slug=eq.${slug}&select=blocked_countries&active=eq.true`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    )
    const data = await res.json()
    const creator = data?.[0]

    if (creator?.blocked_countries?.includes(country)) {
      return NextResponse.redirect(new URL('/blocked', req.url))
    }
  } catch {
    // Bei Fehler einfach durchlassen
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
