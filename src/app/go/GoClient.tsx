'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function GoClient() {
  const params = useSearchParams()
  const url = params.get('url') ?? ''
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    if (!url) return

    const ua = navigator.userAgent
    const isInstagram = ua.includes('Instagram')
    const isAndroid = ua.includes('Android')

    if (!isInstagram) {
      window.location.href = url
      return
    }

    if (isAndroid) {
      const stripped = url.replace(/^https?:\/\//, '')
      window.location.href = `intent://${stripped}#Intent;scheme=https;package=com.android.chrome;end`
      setTimeout(() => setShowFallback(true), 1500)
      return
    }

    // iOS Instagram — window.open zwingt externen Browser
    const opened = window.open(url, '_blank')
    if (!opened) {
      // Falls Popup blockiert → Fallback Button zeigen
      setShowFallback(true)
    }
  }, [url])

  if (showFallback) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="text-4xl">🌐</div>
          <div>
            <h1 className="text-xl font-bold mb-2">Im Browser öffnen</h1>
            <p className="text-zinc-400 text-sm">
              Tippe unten auf <strong className="text-white">„···"</strong> und wähle{' '}
              <strong className="text-white">„In Safari öffnen"</strong>
            </p>
          </div>
          <a
            href={url}
            className="block w-full bg-white text-black font-semibold py-3.5 rounded-xl"
          >
            Link öffnen
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  )
}
