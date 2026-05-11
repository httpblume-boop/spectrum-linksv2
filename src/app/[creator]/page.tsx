import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { getServiceClient } from '@/lib/supabase'
import { findCreator } from '@/lib/lookupCreator'
import CreatorPage from '@/components/CreatorPage'
import InstagramBreakout from '@/components/InstagramBreakout'

const BOT_PATTERNS = [
  /bot\b/i, /crawl/i, /spider/i, /facebookexternalhit/i, /meta-externalagent/i,
  /linkpreview/i, /preview/i, /scraper/i, /whatsapp/i, /telegram(?!Bot)/i,
  /slackbot/i, /discordbot/i, /twitterbot/i, /linkedinbot/i,
]

function isBot(ua: string): boolean {
  return BOT_PATTERNS.some((p) => p.test(ua))
}

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
  const ua = headersList.get('user-agent') ?? ''

  const creator = await findCreator(slug, host)
  if (!creator) notFound()

  // Bot / Crawler → minimale Seite ohne OF-Link
  if (isBot(ua)) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>
        <p>Loading...</p>
      </div>
    )
  }

  // Instagram In-App Browser → Auto-Escape
  const proto = headersList.get('x-forwarded-proto') ?? 'https'
  if (/Instagram/i.test(ua)) {
    const pageUrl = `${proto}://${host}/${slug}?ref=ig-breakout`
    return <InstagramBreakout creatorName={creator.name} bannerUrl={creator.banner_url} pageUrl={pageUrl} />
  }

  const supabase = getServiceClient()
  // Nur id, title, icon — KEINE url (sonst stünde sie im HTML)
  const { data: links } = await supabase
    .from('links')
    .select('id, title, icon')
    .eq('creator_id', creator.id)
    .eq('active', true)
    .order('sort_order')

  const { data: gallery } = await supabase
    .from('gallery_images')
    .select('*')
    .eq('creator_id', creator.id)
    .order('sort_order')

  // Nur UI-Felder an Client geben — NIEMALS of_link!
  const publicCreator = {
    id: creator.id,
    slug: creator.slug,
    name: creator.name,
    handle: creator.handle,
    bio: creator.bio,
    banner_url: creator.banner_url,
    avatar_url: creator.avatar_url,
    of_card_image_url: creator.of_card_image_url,
    of_card_title: creator.of_card_title,
  }

  return <CreatorPage creator={publicCreator} links={links ?? []} gallery={gallery ?? []} />
}
