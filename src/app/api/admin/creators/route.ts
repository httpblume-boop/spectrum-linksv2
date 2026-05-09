import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getServiceClient } from '@/lib/supabase'

async function checkAuth() {
  const cookieStore = await cookies()
  return cookieStore.get('admin_auth')?.value === process.env.ADMIN_PASSWORD
}

export async function GET() {
  if (!await checkAuth()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const supabase = getServiceClient()
  const { data } = await supabase.from('creators').select('*').order('created_at', { ascending: false })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await req.json()
  const supabase = getServiceClient()
  const { data, error } = await supabase.from('creators').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
