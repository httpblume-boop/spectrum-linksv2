import { requireAdmin } from '@/lib/auth'
import { getServiceClient } from '@/lib/supabase'
import Link from 'next/link'
import { Plus, ExternalLink, BarChart2, TrendingUp, Eye, MousePointer2, Users } from 'lucide-react'
import { BrandHeader } from '@/components/Brand'
import Footer from '@/components/Footer'

export default async function AdminDashboard() {
  await requireAdmin()
  const supabase = getServiceClient()

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const previousWeek = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  const { data: creators } = await supabase
    .from('creators')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: clicks30d } = await supabase
    .from('click_events')
    .select('creator_id, link_type, clicked_at')
    .gte('clicked_at', thirtyDaysAgo)

  const { data: views30d } = await supabase
    .from('page_views')
    .select('creator_id, viewed_at')
    .gte('viewed_at', thirtyDaysAgo)

  // Aggregate
  const clickByCreator: Record<string, number> = {}
  const viewByCreator: Record<string, number> = {}
  const clicksByDay: Record<string, number> = {}
  const viewsByDay: Record<string, number> = {}
  let ofClicks30d = 0
  let clicks7d = 0
  let clicks7to14 = 0

  clicks30d?.forEach((c) => {
    clickByCreator[c.creator_id] = (clickByCreator[c.creator_id] ?? 0) + 1
    const day = c.clicked_at.slice(0, 10)
    clicksByDay[day] = (clicksByDay[day] ?? 0) + 1
    if (c.link_type === 'of_link') ofClicks30d++
    if (c.clicked_at >= sevenDaysAgo) clicks7d++
    else if (c.clicked_at >= previousWeek) clicks7to14++
  })

  views30d?.forEach((v) => {
    viewByCreator[v.creator_id] = (viewByCreator[v.creator_id] ?? 0) + 1
    const day = v.viewed_at.slice(0, 10)
    viewsByDay[day] = (viewsByDay[day] ?? 0) + 1
  })

  const totalViews = views30d?.length ?? 0
  const totalClicks = clicks30d?.length ?? 0
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0'
  const ofCtr = totalViews > 0 ? ((ofClicks30d / totalViews) * 100).toFixed(1) : '0'
  const activeCreators = creators?.filter((c) => c.active).length ?? 0
  const trend = clicks7to14 > 0 ? (((clicks7d - clicks7to14) / clicks7to14) * 100).toFixed(0) : null

  // 14-Tage Chart
  const dayKeys: string[] = []
  for (let i = 13; i >= 0; i--) {
    dayKeys.push(new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
  }
  const maxDay = Math.max(1, ...dayKeys.map((d) => Math.max(viewsByDay[d] ?? 0, clicksByDay[d] ?? 0)))

  const topCreators = [...(creators ?? [])]
    .map((c) => ({ ...c, clicks: clickByCreator[c.id] ?? 0, views: viewByCreator[c.id] ?? 0 }))
    .sort((a, b) => b.clicks - a.clicks)

  return (
    <div className="min-h-screen bg-[#0a0612] text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-950/30 via-transparent to-purple-900/10 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <BrandHeader />
          <Link
            href="/admin/creators/new"
            className="flex items-center gap-2 bg-gradient-to-br from-purple-500 to-purple-700 text-white font-semibold px-4 py-2.5 rounded-xl hover:from-purple-400 hover:to-purple-600 transition-all shadow-lg shadow-purple-900/50 text-sm"
          >
            <Plus size={16} />
            Creator hinzufügen
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KpiCard
            icon={<Users size={18} />}
            label="Aktive Creator"
            value={activeCreators}
            sub={`${creators?.length ?? 0} insgesamt`}
          />
          <KpiCard
            icon={<Eye size={18} />}
            label="Aufrufe (30d)"
            value={totalViews}
          />
          <KpiCard
            icon={<MousePointer2 size={18} />}
            label="Klicks (30d)"
            value={totalClicks}
            sub={`${ctr}% CTR`}
            trend={trend}
          />
          <KpiCard
            icon={<TrendingUp size={18} />}
            label="OF Conversions"
            value={ofClicks30d}
            sub={`${ofCtr}%`}
            highlight
          />
        </div>

        {/* Trend Chart */}
        <div className="bg-[#16102b]/80 backdrop-blur border border-purple-900/40 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-white">Trend (14 Tage)</h2>
              <p className="text-purple-300/50 text-xs mt-0.5">Aufrufe vs. Klicks</p>
            </div>
            <Link
              href="/admin/analytics"
              className="text-purple-300 hover:text-white text-xs flex items-center gap-1 transition-colors"
            >
              Details <BarChart2 size={12} />
            </Link>
          </div>
          <div className="flex items-end gap-1.5 h-32">
            {dayKeys.map((d) => {
              const v = viewsByDay[d] ?? 0
              const c = clicksByDay[d] ?? 0
              const day = new Date(d).toLocaleDateString('de-DE', { weekday: 'short' })[0]
              return (
                <div key={d} className="flex-1 flex flex-col items-center gap-1.5 min-w-0 group">
                  <div className="w-full flex gap-0.5 justify-end h-24 items-end">
                    <div
                      className="flex-1 bg-purple-900/60 rounded-sm relative group/bar transition-all hover:bg-purple-800"
                      style={{ height: `${Math.max((v / maxDay) * 100, v ? 4 : 0)}%` }}
                    >
                      <Tooltip text={`${v} Views`} />
                    </div>
                    <div
                      className="flex-1 bg-gradient-to-t from-purple-500 to-purple-300 rounded-sm relative group/bar transition-all"
                      style={{ height: `${Math.max((c / maxDay) * 100, c ? 4 : 0)}%` }}
                    >
                      <Tooltip text={`${c} Klicks`} />
                    </div>
                  </div>
                  <span className="text-[10px] text-purple-300/40">{day}</span>
                </div>
              )
            })}
          </div>
          <div className="flex gap-4 text-xs text-purple-300/60 mt-4">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-purple-900/60 rounded-sm" /> Aufrufe</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-gradient-to-t from-purple-500 to-purple-300 rounded-sm" /> Klicks</span>
          </div>
        </div>

        {/* Creator List */}
        <div className="bg-[#16102b]/80 backdrop-blur border border-purple-900/40 rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-4">Creator</h2>

          {topCreators.length === 0 ? (
            <div className="text-center text-purple-300/50 py-12">
              <p className="mb-3">Noch keine Creator angelegt.</p>
              <Link
                href="/admin/creators/new"
                className="inline-flex items-center gap-2 text-purple-300 hover:text-white text-sm transition-colors"
              >
                <Plus size={14} /> Ersten Creator anlegen
              </Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {topCreators.map((creator) => {
                const cCtr = creator.views > 0 ? ((creator.clicks / creator.views) * 100).toFixed(0) : '0'
                return (
                  <div
                    key={creator.id}
                    className="bg-[#1f1638]/60 border border-purple-900/30 hover:border-purple-700/50 rounded-xl p-4 flex items-center gap-4 transition-all group"
                  >
                    {creator.avatar_url ? (
                      <img src={creator.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover border border-purple-800/50" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold">
                        {creator.name[0]?.toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white truncate">{creator.name}</span>
                        {!creator.active && (
                          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded uppercase tracking-wider">inaktiv</span>
                        )}
                      </div>
                      <p className="text-purple-300/60 text-xs">/{creator.slug}</p>
                    </div>

                    <div className="hidden sm:flex gap-5 text-right">
                      <Stat label="Views" value={creator.views} />
                      <Stat label="Klicks" value={creator.clicks} />
                      <Stat label="CTR" value={`${cCtr}%`} />
                    </div>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/analytics?creator=${creator.id}`}
                        className="p-2 text-purple-300/70 hover:text-white hover:bg-purple-900/30 rounded-lg transition-colors"
                        title="Analytics"
                      >
                        <BarChart2 size={16} />
                      </Link>
                      <a
                        href={`/${creator.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-purple-300/70 hover:text-white hover:bg-purple-900/30 rounded-lg transition-colors"
                        title="Live Page öffnen"
                      >
                        <ExternalLink size={16} />
                      </a>
                      <Link
                        href={`/admin/creators/${creator.id}`}
                        className="bg-purple-900/40 hover:bg-purple-700/60 border border-purple-700/50 text-white text-sm px-4 py-2 rounded-lg transition-all"
                      >
                        Bearbeiten
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  )
}

function KpiCard({
  icon, label, value, sub, trend, highlight,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  sub?: string
  trend?: string | null
  highlight?: boolean
}) {
  return (
    <div className={`relative overflow-hidden bg-[#16102b]/80 backdrop-blur border rounded-2xl p-5 ${highlight ? 'border-purple-500/50 shadow-lg shadow-purple-900/30' : 'border-purple-900/40'}`}>
      {highlight && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent pointer-events-none" />
      )}
      <div className="relative flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${highlight ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-900/30 text-purple-300/70'}`}>
          {icon}
        </div>
        {trend !== undefined && trend !== null && (
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${Number(trend) >= 0 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
            {Number(trend) >= 0 ? '↑' : '↓'} {Math.abs(Number(trend))}%
          </span>
        )}
      </div>
      <p className="relative text-purple-300/60 text-xs mb-0.5">{label}</p>
      <p className="relative text-3xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString('de-DE') : value}</p>
      {sub && <p className="relative text-purple-300/40 text-xs mt-1">{sub}</p>}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <p className="text-[10px] text-purple-300/40 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-white">{typeof value === 'number' ? value.toLocaleString('de-DE') : value}</p>
    </div>
  )
}

function Tooltip({ text }: { text: string }) {
  return (
    <span className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-black/90 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none z-10 border border-purple-800/50">
      {text}
    </span>
  )
}
