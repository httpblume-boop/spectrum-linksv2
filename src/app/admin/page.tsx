import { requireAdmin } from '@/lib/auth'
import { getServiceClient } from '@/lib/supabase'
import Link from 'next/link'
import { Plus, ExternalLink, BarChart2 } from 'lucide-react'

export default async function AdminDashboard() {
  await requireAdmin()
  const supabase = getServiceClient()

  const { data: creators } = await supabase
    .from('creators')
    .select('*')
    .order('created_at', { ascending: false })

  // Klicks der letzten 30 Tage pro Creator
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: clicks } = await supabase
    .from('click_events')
    .select('creator_id')
    .gte('clicked_at', thirtyDaysAgo)

  const clickMap: Record<string, number> = {}
  clicks?.forEach((c) => {
    clickMap[c.creator_id] = (clickMap[c.creator_id] ?? 0) + 1
  })

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Link
            href="/admin/creators/new"
            className="flex items-center gap-2 bg-white text-black font-semibold px-4 py-2 rounded-xl hover:bg-zinc-200 transition-colors text-sm"
          >
            <Plus size={16} />
            Creator hinzufügen
          </Link>
        </div>

        <div className="grid gap-4">
          {creators?.map((creator) => (
            <div
              key={creator.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{creator.name}</span>
                  {!creator.active && (
                    <span className="text-xs bg-zinc-700 px-2 py-0.5 rounded-full text-zinc-400">
                      inaktiv
                    </span>
                  )}
                </div>
                <p className="text-zinc-400 text-sm mt-0.5">/{creator.slug}</p>
                <p className="text-zinc-500 text-xs mt-1">
                  {clickMap[creator.id] ?? 0} Klicks (30 Tage)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/analytics?creator=${creator.id}`}
                  className="p-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <BarChart2 size={18} />
                </Link>
                <a
                  href={`/${creator.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <ExternalLink size={18} />
                </a>
                <Link
                  href={`/admin/creators/${creator.id}`}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white text-sm px-4 py-2 rounded-xl transition-colors"
                >
                  Bearbeiten
                </Link>
              </div>
            </div>
          ))}

          {!creators?.length && (
            <div className="text-center text-zinc-500 py-16">
              Noch keine Creator. Füge deinen ersten hinzu.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
