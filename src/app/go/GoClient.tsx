'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function GoClient() {
  const params = useSearchParams()
  const url = params.get('url') ?? ''
  const [showManual, setShowManual] = useState(false)

  useEffect(() => {
    if (!url) return

    const ua = navigator.userAgent
    const isInstagram = ua.includes('Instagram')
    const isAndroid = ua.includes('Android')
    const isIOS = /iPhone|iPad|iPod/.test(ua)

    if (!isInstagram) {
      // Normaler Browser — direkt weiterleiten
      window.location.href = url
      return
    }

    if (isAndroid) {
      // Android: Intent URL erzwingt Chrome
      const stripped = url.replace(/^https?:\/\//, '')
      window.location.href = `intent://${stripped}#Intent;scheme=https;package=com.android.chrome;end`
      setTimeout(() => setShowManual(true), 1500)
      return
    }

    if (isIOS) {
      // iOS: Link in Clipboard kopieren + Safari-Trick
      try {
        navigator.clipboard?.writeText(url)
      } catch {}
      // Zeige sofort die manuelle Anleitung
      setShowManual(true)
      return
    }

    // Fallback
    window.location.href = url
  }, [url])

  if (!url) return null

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        {!showManual ? (
          <div className="space-y-4">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
            <p className="text-zinc-400 text-sm">Weiterleitung...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-4xl">🌐</div>
            <div>
              <h1 className="text-xl font-bold mb-2">Im Browser öffnen</h1>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Tippe unten auf <strong className="text-white">„···"</strong> oder{' '}
                <strong className="text-white">„Teilen"</strong> und wähle{' '}
                <strong className="text-white">„In Safari öffnen"</strong> /{' '}
                <strong className="text-white">„In Chrome öffnen"</strong>
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 text-left space-y-3">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Oder direkt öffnen</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-white text-black font-semibold py-3 rounded-xl text-center hover:bg-zinc-200 transition-colors"
              >
                Link öffnen
              </a>
            </div>

            <p className="text-zinc-600 text-xs">
              Der Link wurde in die Zwischenablage kopiert
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
