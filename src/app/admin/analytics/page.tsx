import { requireAdmin } from '@/lib/auth'
import { getServiceClient } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ creator?: string; days?: string }>
}) {
  await requireAdmin()
  const { creator: creatorId, days = '30' } = await searchParams
  const supabase = getServiceClient()

  const { data: creators } = await supabase.from('creators').select('id, name, slug').order('name')

  const daysAgo = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000).toISOString()

  let query = supabase
    .from('click_events')
    .select('link_type, clicked_at, creator_id, creators(name)')
    .gte('clicked_at', daysAgo)
    .order('clicked_at', { ascending: false })

  if (creatorId) query = query.eq('creator_id', creatorId)

  const { data: events } = await query.limit(500)

  // Aggregation
  const byDay: Record<string, number> = {}
  const byType: Record<string, number> = {}
  const byCreator: Record<string, number> = {}

  events?.forEach((e) => {
    const day = e.clicked_at.slice(0, 10)
    byDay[day] = (byDay[day] ?? 0) + 1
    byType[e.link_type] = (byType[e.link_type] ?? 0) + 1
    const name = (e.creators as unknown as { name: string } | null)?.name ?? e.creator_id
    byCreator[name] = (byCreator[name] ?? 0) + 1
  })

  const totalClicks = events?.length ?? 0

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm">
          <ArrowLeft size={16} /> Zurück
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Analytics</h1>
          <div className="flex gap-2">
            {['7', '30', '90'].map((d) => (
              <Link
                key={d}
                href={`/admin/analytics?${creatorId ? `creator=${creatorId}&` : ''}days=${d}`}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${days === d ? 'bg-white text-black font-semibold' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
              >
                {d}d
              </Link>
            ))}
          </div>
        </div>

        {/* Creator Filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          <Link
            href={`/admin/analytics?days=${days}`}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${!creatorId ? 'bg-white text-black font-semibold' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
          >
            Alle
          </Link>
          {creators?.map((c) => (
            <Link
              key={c.id}
              href={`/admin/analytics?creator=${c.id}&days=${days}`}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${creatorId === c.id ? 'bg-white text-black font-semibold' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Klicks gesamt" value={totalClicks} />
          <StatCard label="OF Card Klicks" value={byType['of_link'] ?? 0} />
          <StatCard label="Link Klicks" value={byType['link'] ?? 0} />
        </div>

        {/* Klicks nach Creator */}
        {!creatorId && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-4">
            <h2 className="font-semibold mb-4">Klicks nach Creator</h2>
            <div className="space-y-2">
              {Object.entries(byCreator)
                .sort(([, a], [, b]) => b - a)
                .map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-300">{name}</span>
                    <span className="text-zinc-400">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Klicks nach Tag */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="font-semibold mb-4">Klicks pro Tag</h2>
          <div className="space-y-2">
            {Object.entries(byDay)
              .sort(([a], [b]) => b.localeCompare(a))
              .slice(0, 14)
              .map(([day, count]) => (
                <div key={day} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-300">{day}</span>
                  <div className="flex items-center gap-3">
                    <div
                      className="bg-zinc-700 h-2 rounded-full"
                      style={{ width: `${Math.max(4, (count / totalClicks) * 200)}px` }}
                    />
                    <span className="text-zinc-400 w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <p className="text-zinc-400 text-xs mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}
