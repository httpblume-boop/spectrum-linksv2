import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { supabase } from '@/lib/supabase'
import CreatorPage from '@/components/CreatorPage'
import InstagramBreakout from '@/components/InstagramBreakout'

export async function generateMetadata({ params }: { params: Promise<{ creator: string }> }) {
  const { creator: slug } = await params
  const { data } = await supabase
    .from('creators')
    .select('name, bio')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (!data) return { title: 'Not Found' }
  return { title: data.name, description: data.bio }
}

export default async function Page({ params }: { params: Promise<{ creator: string }> }) {
  const { creator: slug } = await params

  const { data: creator } = await supabase
    .from('creators')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (!creator) notFound()

  // Instagram In-App Browser → Auto-Escape mit instagram://extbrowser Schema
  const headersList = await headers()
  const ua = headersList.get('user-agent') ?? ''
  const host = headersList.get('host') ?? ''
  const proto = headersList.get('x-forwarded-proto') ?? 'https'
  if (/Instagram/i.test(ua)) {
    const pageUrl = `${proto}://${host}/${slug}?ref=ig-breakout`
    return <InstagramBreakout creatorName={creator.name} bannerUrl={creator.banner_url} pageUrl={pageUrl} />
  }

  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('creator_id', creator.id)
    .eq('active', true)
    .order('sort_order')

  const { data: gallery } = await supabase
    .from('gallery_images')
    .select('*')
    .eq('creator_id', creator.id)
    .order('sort_order')

  return <CreatorPage creator={creator} links={links ?? []} gallery={gallery ?? []} />
}
