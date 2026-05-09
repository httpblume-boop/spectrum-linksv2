'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

const COUNTRIES = [
  { code: 'DE', name: 'Deutschland' },
  { code: 'AT', name: 'Österreich' },
  { code: 'CH', name: 'Schweiz' },
  { code: 'US', name: 'USA' },
  { code: 'GB', name: 'Großbritannien' },
  { code: 'FR', name: 'Frankreich' },
  { code: 'IT', name: 'Italien' },
  { code: 'ES', name: 'Spanien' },
  { code: 'NL', name: 'Niederlande' },
  { code: 'BE', name: 'Belgien' },
  { code: 'PL', name: 'Polen' },
  { code: 'RU', name: 'Russland' },
  { code: 'TR', name: 'Türkei' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'Indien' },
  { code: 'BR', name: 'Brasilien' },
  { code: 'AU', name: 'Australien' },
  { code: 'CA', name: 'Kanada' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'Südkorea' },
  { code: 'SA', name: 'Saudi-Arabien' },
  { code: 'AE', name: 'VAE' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'ZA', name: 'Südafrika' },
]

type Props = {
  value: string[]
  onChange: (codes: string[]) => void
}

export default function CountryBlocklist({ value, onChange }: Props) {
  const [search, setSearch] = useState('')

  const filtered = COUNTRIES.filter(
    (c) =>
      !value.includes(c.code) &&
      (c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase()))
  )

  function add(code: string) {
    onChange([...value, code])
    setSearch('')
  }

  function remove(code: string) {
    onChange(value.filter((c) => c !== code))
  }

  return (
    <div className="space-y-3">
      {/* Gesperrte Länder */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((code) => {
            const country = COUNTRIES.find((c) => c.code === code)
            return (
              <span
                key={code}
                className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 text-red-300 text-sm px-3 py-1 rounded-full"
              >
                {country?.name ?? code}
                <button type="button" onClick={() => remove(code)} className="hover:text-white">
                  <X size={12} />
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* Suche */}
      <input
        type="text"
        placeholder="Land suchen und hinzufügen..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-zinc-500"
      />

      {/* Dropdown */}
      {search && filtered.length > 0 && (
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
          {filtered.slice(0, 8).map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => add(c.code)}
              className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors flex items-center justify-between"
            >
              {c.name}
              <span className="text-zinc-500 text-xs">{c.code}</span>
            </button>
          ))}
        </div>
      )}

      {value.length === 0 && !search && (
        <p className="text-zinc-600 text-xs">Noch keine Länder gesperrt</p>
      )}
    </div>
  )
}
