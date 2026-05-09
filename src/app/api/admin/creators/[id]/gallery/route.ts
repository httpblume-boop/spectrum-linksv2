import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getServiceClient } from '@/lib/supabase'

async function checkAuth() {
  const cookieStore = await cookies()
  return cookieStore.get('admin_auth')?.value === process.env.ADMIN_PASSWORD
}

// Ersetzt alle Galerie-Bilder eines Creators
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAuth()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const urls: string[] = await req.json()
  const supabase = getServiceClient()

  await supabase.from('gallery_images').delete().eq('creator_id', id)

  if (urls.length) {
    await supabase.from('gallery_images').insert(
      urls.map((image_url, sort_order) => ({ creator_id: id, image_url, sort_order }))
    )
  }

  return NextResponse.json({ ok: true })
}
