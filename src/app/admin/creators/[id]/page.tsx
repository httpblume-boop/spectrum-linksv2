import { requireAdmin } from '@/lib/auth'
import { getServiceClient } from '@/lib/supabase'
import CreatorForm from '@/components/CreatorForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function EditCreatorPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const supabase = getServiceClient()

  const { data: creator } = await supabase.from('creators').select('*').eq('id', id).single()
  if (!creator) notFound()

  const { data: links } = await supabase.from('links').select('*').eq('creator_id', id).order('sort_order')
  const { data: gallery } = await supabase.from('gallery_images').select('*').eq('creator_id', id).order('sort_order')

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/admin" className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm">
          <ArrowLeft size={16} /> Zurück
        </Link>
        <h1 className="text-2xl font-bold mb-8">{creator.name} bearbeiten</h1>
        <CreatorForm
          creator={creator}
          links={links ?? []}
          galleryUrls={gallery?.map((g) => g.image_url) ?? []}
        />
      </div>
    </div>
  )
}
