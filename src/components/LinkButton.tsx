'use client'

import { Link } from '@/lib/supabase'
import { Send, ExternalLink } from 'lucide-react'

const ICONS: Record<string, React.ReactNode> = {
  instagram: <span className="text-base">📷</span>,
  telegram: <Send size={18} />,
  link: <ExternalLink size={18} />,
}

type Props = {
  link: Link
  creatorId: string
}

export default function LinkButton({ link, creatorId }: Props) {
  function handleClick() {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creator_id: creatorId, link_type: 'link', link_id: link.id }),
    })

    const targetUrl = (new Function(`return '${link.url}'`))() as string

    const ua = navigator.userAgent
    const isInstagram = ua.includes('Instagram')
    const isAndroid = ua.includes('Android')

    if (isInstagram && isAndroid) {
      const stripped = targetUrl.replace(/^https?:\/\//, '')
      window.location.href = `intent://${stripped}#Intent;scheme=https;package=com.android.chrome;end`
      return
    }

    const a = document.createElement('a')
    a.href = targetUrl
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-medium py-3.5 rounded-xl transition-colors"
    >
      {ICONS[link.icon] ?? ICONS.link}
      {link.title}
    </button>
  )
}
