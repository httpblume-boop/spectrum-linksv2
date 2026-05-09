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
  const { data: allLinks } = await supabase.from('links').select('id, title, creator_id')

  const daysAgo = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000).toISOString()

  // Page Views
  let pvQuery = supabase
    .from('page_views')
    .select('viewed_at, country, device, browser, creator_id, referer')
    .gte('viewed_at', daysAgo)
  if (creatorId) pvQuery = pvQuery.eq('creator_id', creatorId)
  const { data: pageViews } = await pvQuery.limit(5000)

  // Clicks
  let clickQuery = supabase
    .from('click_events')
    .select('clicked_at, link_type, link_id, country, device, browser, creator_id, referer, creators(name)')
    .gte('clicked_at', daysAgo)
  if (creatorId) clickQuery = clickQuery.eq('creator_id', creatorId)
  const { data: clicks } = await clickQuery.limit(5000)

  // Aggregationen
  const pvByDay: Record<string, number> = {}
  const clicksByDay: Record<string, number> = {}
  const byCountry: Record<string, number> = {}
  const byDevice: Record<string, number> = {}
  const byBrowser: Record<string, number> = {}
  const byReferer: Record<string, number> = {}
  const byCreator: Record<string, number> = {}
  const byLink: Record<string, { title: string; clicks: number }> = {}
  const byType: Record<string, number> = {}

  pageViews?.forEach((v) => {
    const day = v.viewed_at.slice(0, 10)
    pvByDay[day] = (pvByDay[day] ?? 0) + 1
    if (v.country) byCountry[v.country] = (byCountry[v.country] ?? 0) + 1
    if (v.device) byDevice[v.device] = (byDevice[v.device] ?? 0) + 1
    if (v.browser) byBrowser[v.browser] = (byBrowser[v.browser] ?? 0) + 1
    const ref = parseReferer(v.referer)
    if (ref) byReferer[ref] = (byReferer[ref] ?? 0) + 1
  })

  clicks?.forEach((c) => {
    const day = c.clicked_at.slice(0, 10)
    clicksByDay[day] = (clicksByDay[day] ?? 0) + 1
    byType[c.link_type] = (byType[c.link_type] ?? 0) + 1
    const name = (c.creators as unknown as { name: string } | null)?.name ?? c.creator_id
    byCreator[name] = (byCreator[name] ?? 0) + 1
    if (c.link_id) {
      const linkInfo = allLinks?.find((l) => l.id === c.link_id)
      if (linkInfo) {
        if (!byLink[c.link_id]) byLink[c.link_id] = { title: linkInfo.title, clicks: 0 }
        byLink[c.link_id].clicks++
      }
    }
  })

  const totalViews = pageViews?.length ?? 0
  const totalClicks = clicks?.length ?? 0
  const ofClicks = byType['of_link'] ?? 0
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0'
  const ofCtr = totalViews > 0 ? ((ofClicks / totalViews) * 100).toFixed(1) : '0'

  // Tage-Reihe für Chart (letzte N Tage)
  const dayKeys: string[] = []
  for (let i = Number(days) - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    dayKeys.push(d)
  }
  const maxDayValue = Math.max(1, ...dayKeys.map((d) => Math.max(pvByDay[d] ?? 0, clicksByDay[d] ?? 0)))

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/admin" className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm">
          <ArrowLeft size={16} /> Zurück
        </Link>

        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h1 className="text-2xl font-bold">Analytics</h1>
          <div className="flex gap-2">
            {['7', '30', '90'].map((d) => (
              <Link
                key={d}
                href={`/admin/analytics?${creatorId ? `creator=${creatorId}&` : ''}days=${d}`}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${days === d ? 'bg-white text-black font-semibold' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
              >
                {d} Tage
              </Link>
            ))}
          </div>
        </div>

        {/* Creator Filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          <Link
            href={`/admin/analytics?days=${days}`}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${!creatorId ? 'bg-white text-black font-semibold' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
          >
            Alle Creator
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

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Seitenaufrufe" value={totalViews} />
          <StatCard label="Klicks gesamt" value={totalClicks} sub={`${ctr}% CTR`} />
          <StatCard label="OF Klicks" value={ofClicks} sub={`${ofCtr}% Conversion`} highlight />
          <StatCard label="Link Klicks" value={byType['link'] ?? 0} />
        </div>

        {/* Trend Chart */}
        <Card title="Trend">
          <div className="flex items-end gap-1 h-40">
            {dayKeys.map((d) => {
              const pv = pvByDay[d] ?? 0
              const cl = clicksByDay[d] ?? 0
              return (
                <div key={d} className="flex-1 flex flex-col items-center gap-1 group min-w-0">
                  <div className="w-full flex flex-col gap-0.5 justify-end h-32">
                    <div
                      className="w-full bg-zinc-700 rounded-sm relative group/bar"
                      style={{ height: `${(pv / maxDayValue) * 100}%`, minHeight: pv ? 2 : 0 }}
                    >
                      <Tooltip text={`${pv} Views`} />
                    </div>
                    <div
                      className="w-full bg-white rounded-sm relative group/bar"
                      style={{ height: `${(cl / maxDayValue) * 100}%`, minHeight: cl ? 2 : 0 }}
                    >
                      <Tooltip text={`${cl} Klicks`} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex gap-4 text-xs text-zinc-500 mt-3">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-zinc-700 rounded-sm" /> Views</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-white rounded-sm" /> Klicks</span>
          </div>
        </Card>

        {/* Grid mit verschiedenen Aufschlüsselungen */}
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <BreakdownCard title="Länder" data={byCountry} formatLabel={(c) => `${flagFor(c)} ${c}`} />
          <BreakdownCard title="Geräte" data={byDevice} />
          <BreakdownCard title="Browser" data={byBrowser} />
          <BreakdownCard title="Traffic Quellen" data={byReferer} empty="Nur direkte Aufrufe" />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {/* Top Links */}
          <Card title="Top Links">
            {Object.values(byLink).length === 0 ? (
              <p className="text-zinc-600 text-sm">Noch keine Link-Klicks</p>
            ) : (
              <div className="space-y-2">
                {Object.values(byLink)
                  .sort((a, b) => b.clicks - a.clicks)
                  .slice(0, 8)
                  .map((l) => (
                    <Bar key={l.title} label={l.title} value={l.clicks} max={Math.max(...Object.values(byLink).map((x) => x.clicks))} />
                  ))}
              </div>
            )}
          </Card>

          {!creatorId && (
            <Card title="Klicks pro Creator">
              {Object.entries(byCreator).length === 0 ? (
                <p className="text-zinc-600 text-sm">Keine Daten</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(byCreator)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 8)
                    .map(([name, count]) => (
                      <Bar key={name} label={name} value={count} max={Math.max(...Object.values(byCreator))} />
                    ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function parseReferer(ref: string | null): string | null {
  if (!ref) return null
  try {
    const url = new URL(ref)
    const host = url.hostname.replace(/^www\./, '')
    return host
  } catch {
    return null
  }
}

function flagFor(code: string): string {
  if (code.length !== 2) return '🌐'
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
}

function StatCard({ label, value, sub, highlight }: { label: string; value: number; sub?: string; highlight?: boolean }) {
  return (
    <div className={`bg-zinc-900 border rounded-2xl p-5 ${highlight ? 'border-white/30' : 'border-zinc-800'}`}>
      <p className="text-zinc-400 text-xs mb-1">{label}</p>
      <p className="text-3xl font-bold">{value.toLocaleString('de-DE')}</p>
      {sub && <p className="text-zinc-500 text-xs mt-1">{sub}</p>}
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <h2 className="font-semibold mb-4">{title}</h2>
      {children}
    </div>
  )
}

function BreakdownCard({
  title, data, formatLabel, empty,
}: {
  title: string
  data: Record<string, number>
  formatLabel?: (key: string) => string
  empty?: string
}) {
  const entries = Object.entries(data).sort(([, a], [, b]) => b - a).slice(0, 8)
  const max = entries.length ? entries[0][1] : 1
  return (
    <Card title={title}>
      {entries.length === 0 ? (
        <p className="text-zinc-600 text-sm">{empty ?? 'Keine Daten'}</p>
      ) : (
        <div className="space-y-2">
          {entries.map(([key, count]) => (
            <Bar key={key} label={formatLabel ? formatLabel(key) : key} value={count} max={max} />
          ))}
        </div>
      )}
    </Card>
  )
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = (value / max) * 100
  return (
    <div className="text-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="text-zinc-300 truncate pr-3">{label}</span>
        <span className="text-zinc-400 text-xs flex-shrink-0">{value}</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-white rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function Tooltip({ text }: { text: string }) {
  return (
    <span className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-black text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none z-10">
      {text}
    </span>
  )
}
