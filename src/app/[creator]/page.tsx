import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { getServiceClient } from '@/lib/supabase'
import { findCreator } from '@/lib/lookupCreator'
import CreatorPage from '@/components/CreatorPage'
import InstagramBreakout from '@/components/InstagramBreakout'

export async function generateMetadata({ params }: { params: Promise<{ creator: string }> }) {
  const { creator: slug } = await params
  const headersList = await headers()
  const data = await findCreator(slug, headersList.get('host'))
  if (!data) return { title: 'Not Found' }
  return { title: data.name, description: data.bio }
}

export default async function Page({ params }: { params: Promise<{ creator: string }> }) {
  const { creator: slug } = await params

  const headersList = await headers()
  const host = headersList.get('host')

  const creator = await findCreator(slug, host)
  if (!creator) notFound()

  // Instagram In-App Browser → Auto-Escape
  const ua = headersList.get('user-agent') ?? ''
  const proto = headersList.get('x-forwarded-proto') ?? 'https'
  if (/Instagram/i.test(ua)) {
    const pageUrl = `${proto}://${host}/${slug}?ref=ig-breakout`
    return <InstagramBreakout creatorName={creator.name} bannerUrl={creator.banner_url} pageUrl={pageUrl} />
  }

  const supabase = getServiceClient()
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
