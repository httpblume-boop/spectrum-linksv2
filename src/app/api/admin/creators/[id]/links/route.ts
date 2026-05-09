import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getServiceClient } from '@/lib/supabase'

async function checkAuth() {
  const cookieStore = await cookies()
  return cookieStore.get('admin_auth')?.value === process.env.ADMIN_PASSWORD
}

// Ersetzt alle Links eines Creators
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAuth()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const links = await req.json()
  const supabase = getServiceClient()

  await supabase.from('links').delete().eq('creator_id', id)

  if (links.length) {
    await supabase.from('links').insert(
      links.map((l: Record<string, unknown>, i: number) => ({ ...l, creator_id: id, sort_order: i }))
    )
  }

  return NextResponse.json({ ok: true })
}
