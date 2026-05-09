import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { parseDevice, parseBrowser } from '@/lib/parseUA'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { creator_id, link_type, link_id, event_type } = body

  if (!creator_id) {
    return NextResponse.json({ error: 'missing creator_id' }, { status: 400 })
  }

  const ua = req.headers.get('user-agent') ?? ''
  const referer = req.headers.get('referer')
  const country = req.headers.get('x-vercel-ip-country') ?? null
  const device = parseDevice(ua)
  const browser = parseBrowser(ua)

  const supabase = getServiceClient()

  if (event_type === 'page_view') {
    await supabase.from('page_views').insert({
      creator_id,
      country,
      device,
      browser,
      user_agent: ua,
      referer,
    })
  } else {
    await supabase.from('click_events').insert({
      creator_id,
      link_type,
      link_id: link_id ?? null,
      country,
      device,
      browser,
      user_agent: ua,
      referer,
    })
  }

  return NextResponse.json({ ok: true })
}
