'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Creator, Link as CreatorLink } from '@/lib/supabase'
import { Plus, Trash2 } from 'lucide-react'
import ImageUpload from './ImageUpload'
import CountryBlocklist from './CountryBlocklist'
import PhonePreview from './PhonePreview'

type Props = {
  creator?: Creator
  links?: CreatorLink[]
  galleryUrls?: string[]
}

export default function CreatorForm({ creator, links = [], galleryUrls = [] }: Props) {
  const router = useRouter()
  const isNew = !creator

  const [form, setForm] = useState({
    slug: creator?.slug ?? '',
    name: creator?.name ?? '',
    handle: creator?.handle ?? '',
    bio: creator?.bio ?? '',
    banner_url: creator?.banner_url ?? '',
    avatar_url: creator?.avatar_url ?? '',
    of_link: creator?.of_link ?? '',
    of_card_image_url: creator?.of_card_image_url ?? '',
    of_card_title: creator?.of_card_title ?? 'Das Abenteuer wartet 🤫',
    active: creator?.active ?? true,
    blocked_countries: (creator as Creator & { blocked_countries?: string[] })?.blocked_countries ?? [],
  })

  const [formLinks, setFormLinks] = useState<Partial<CreatorLink>[]>(
    links.length ? links : [{ title: '', url: '', icon: 'instagram', sort_order: 0, js_redirect: false, active: true }]
  )

  const [gallery, setGallery] = useState<string[]>(galleryUrls)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function updateLink(i: number, field: string, value: unknown) {
    setFormLinks((prev) => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let creatorId = creator?.id

      if (isNew) {
        const res = await fetch('/api/admin/creators', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error((await res.json()).error)
        const data = await res.json()
        creatorId = data.id
      } else {
        const res = await fetch(`/api/admin/creators/${creator.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error((await res.json()).error)
      }

      // Links speichern
      await fetch(`/api/admin/creators/${creatorId}/links`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formLinks.filter((l) => l.title && l.url)),
      })

      // Galerie speichern
      await fetch(`/api/admin/creators/${creatorId}/gallery`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gallery.filter(Boolean)),
      })

      router.push('/admin')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fehler')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
      <form onSubmit={handleSubmit} className="space-y-8 min-w-0">
      {/* Basis */}
      <section className="bg-[#16102b]/80 backdrop-blur border border-purple-900/40 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-white">Profil</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <Field label="Slug (URL)" value={form.slug} onChange={(v) => setForm({ ...form, slug: v.toLowerCase().replace(/\s/g, '-') })} required placeholder="z.B. marina" />
        </div>
        <Field label="@Handle" value={form.handle} onChange={(v) => setForm({ ...form, handle: v })} placeholder="z.B. marinaofficial" />
        <Field label="Bio" value={form.bio} onChange={(v) => setForm({ ...form, bio: v })} multiline />
        <ImageUpload label="Banner Bild" value={form.banner_url} onChange={(v) => setForm({ ...form, banner_url: v })} aspect="banner" />
        <ImageUpload label="Profilbild" value={form.avatar_url} onChange={(v) => setForm({ ...form, avatar_url: v })} aspect="square" />
        <label className="flex items-center gap-2 text-sm text-purple-200/80 cursor-pointer">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="rounded"
          />
          Seite aktiv / öffentlich sichtbar
        </label>
      </section>

      {/* Geo Blocking */}
      <section className="bg-[#16102b]/80 backdrop-blur border border-purple-900/40 rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-white">Geo Blocking</h2>
          <p className="text-purple-300/50 text-xs mt-1">Länder die keinen Zugriff auf diese Seite haben</p>
        </div>
        <CountryBlocklist
          value={form.blocked_countries}
          onChange={(codes) => setForm({ ...form, blocked_countries: codes })}
        />
      </section>

      {/* OF Card */}
      <section className="bg-[#16102b]/80 backdrop-blur border border-purple-900/40 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-white">OnlyFans Card</h2>
        <Field label="OF Link" value={form.of_link} onChange={(v) => setForm({ ...form, of_link: v })} placeholder="https://onlyfans.com/..." />
        <ImageUpload label="Card Bild" value={form.of_card_image_url} onChange={(v) => setForm({ ...form, of_card_image_url: v })} aspect="card" />
        <Field label="Card Titel" value={form.of_card_title} onChange={(v) => setForm({ ...form, of_card_title: v })} />
      </section>

      {/* Zusätzliche Links */}
      <section className="bg-[#16102b]/80 backdrop-blur border border-purple-900/40 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">Weitere Links</h2>
          <button
            type="button"
            onClick={() => setFormLinks((prev) => [...prev, { title: '', url: '', icon: 'link', sort_order: prev.length, js_redirect: false, active: true }])}
            className="flex items-center gap-1 text-sm text-purple-300/70 hover:text-white"
          >
            <Plus size={14} /> Link hinzufügen
          </button>
        </div>
        {formLinks.map((link, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <input
                placeholder="Titel (z.B. Instagram)"
                value={link.title ?? ''}
                onChange={(e) => updateLink(i, 'title', e.target.value)}
                className="bg-[#1f1638]/60 border border-purple-900/40 text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-500 transition-colors"
              />
              <input
                placeholder="URL"
                value={link.url ?? ''}
                onChange={(e) => updateLink(i, 'url', e.target.value)}
                className="bg-[#1f1638]/60 border border-purple-900/40 text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-500 transition-colors"
              />
              <select
                value={link.icon ?? 'link'}
                onChange={(e) => updateLink(i, 'icon', e.target.value)}
                className="bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2.5 text-sm outline-none"
              >
                <option value="instagram">Instagram</option>
                <option value="telegram">Telegram</option>
                <option value="link">Link</option>
              </select>
              <label className="flex items-center gap-2 text-xs text-purple-300/70 px-1">
                <input
                  type="checkbox"
                  checked={link.js_redirect ?? false}
                  onChange={(e) => updateLink(i, 'js_redirect', e.target.checked)}
                />
                JS-Redirect (für sensible Links)
              </label>
            </div>
            <button
              type="button"
              onClick={() => setFormLinks((prev) => prev.filter((_, idx) => idx !== i))}
              className="text-purple-300/40 hover:text-red-400 mt-2"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </section>

      {/* Galerie */}
      <section className="bg-[#16102b]/80 backdrop-blur border border-purple-900/40 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">Galerie</h2>
          <button
            type="button"
            onClick={() => setGallery((prev) => [...prev, ''])}
            className="flex items-center gap-1 text-sm text-purple-300/70 hover:text-white"
          >
            <Plus size={14} /> Bild hinzufügen
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {gallery.map((url, i) => (
            <div key={i} className="relative">
              <ImageUpload
                label=""
                value={url}
                onChange={(v) => setGallery((prev) => prev.map((u, idx) => idx === i ? v : u))}
                aspect="square"
              />
              <button
                type="button"
                onClick={() => setGallery((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute -top-2 -right-2 z-10 bg-red-500 rounded-full p-0.5 text-white hover:bg-red-600"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-purple-900/50 disabled:opacity-50"
        >
          {loading ? 'Speichern...' : isNew ? 'Creator erstellen' : 'Änderungen speichern'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="text-purple-300/70 hover:text-white px-4 py-3 transition-colors"
        >
          Abbrechen
        </button>
      </div>
      </form>

      <PhonePreview
        name={form.name}
        handle={form.handle}
        bio={form.bio}
        bannerUrl={form.banner_url}
        avatarUrl={form.avatar_url}
        ofCardImageUrl={form.of_card_image_url}
        ofCardTitle={form.of_card_title}
        links={formLinks}
        gallery={gallery}
      />
    </div>
  )
}

function Field({
  label, value, onChange, required, placeholder, multiline,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  placeholder?: string
  multiline?: boolean
}) {
  const cls = "w-full bg-[#1f1638]/60 border border-purple-900/40 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 transition-colors"
  return (
    <label className="block space-y-1.5">
      <span className="text-sm text-purple-300/70">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={cls}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={cls}
        />
      )}
    </label>
  )
}
