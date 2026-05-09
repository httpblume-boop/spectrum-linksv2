import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { creator_id, link_type, link_id } = body

  if (!creator_id || !link_type) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 })
  }

  const supabase = getServiceClient()
  await supabase.from('click_events').insert({
    creator_id,
    link_type,
    link_id: link_id ?? null,
    user_agent: req.headers.get('user-agent'),
    referer: req.headers.get('referer'),
  })

  return NextResponse.json({ ok: true })
}
