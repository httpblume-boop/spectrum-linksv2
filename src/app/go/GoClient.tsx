'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function GoClient() {
  const params = useSearchParams()
  const url = params.get('url') ?? ''

  useEffect(() => {
    if (!url) return

    const ua = navigator.userAgent
    const isInstagram = ua.includes('Instagram')
    const isAndroid = ua.includes('Android')
    const isIOS = /iPhone|iPad|iPod/.test(ua)

    if (!isInstagram) {
      window.location.href = url
      return
    }

    if (isAndroid) {
      const stripped = url.replace(/^https?:\/\//, '')
      window.location.href = `intent://${stripped}#Intent;scheme=https;package=com.android.chrome;end`
      return
    }

    if (isIOS) {
      // x-safari-https öffnet direkt Safari ohne Dialog
      const safariUrl = url.replace('https://', 'x-safari-https://')
      window.location.href = safariUrl
      return
    }

    window.location.href = url
  }, [url])

  // Minimale Ladeseite — nur kurz sichtbar
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  )
}
