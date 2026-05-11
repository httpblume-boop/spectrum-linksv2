'use client'

import { Send, ExternalLink } from 'lucide-react'

const ICONS: Record<string, React.ReactNode> = {
  instagram: <span className="text-base">📷</span>,
  telegram: <Send size={18} />,
  link: <ExternalLink size={18} />,
}

// Nur UI-Felder — KEINE url!
export type LinkPublic = {
  id: string
  title: string
  icon: string
}

type Props = {
  link: LinkPublic
  creatorSlug: string
}

export default function LinkButton({ link, creatorSlug }: Props) {
  return (
    <a
      href={`/r/${creatorSlug}/${link.id}`}
      target="_blank"
      rel="noopener noreferrer"
      referrerPolicy="no-referrer"
      className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-medium py-3.5 rounded-xl transition-colors"
    >
      {ICONS[link.icon] ?? ICONS.link}
      {link.title}
    </a>
  )
}
