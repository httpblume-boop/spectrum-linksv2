'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function GoClient() {
  const params = useSearchParams()
  const url = params.get('url') ?? ''
  const [copied, setCopied] = useState(false)
  const [isInstagramIOS, setIsInstagramIOS] = useState(false)

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
      // Blob URL Trick — Instagrams Browser kann Blob URLs nicht abfangen
      try {
        const html = `<html><head><meta http-equiv="refresh" content="0;url=${url}"></head><body></body></html>`
        const blob = new Blob([html], { type: 'text/html' })
        const blobUrl = URL.createObjectURL(blob)
        window.location.href = blobUrl
        setTimeout(() => setIsInstagramIOS(true), 1500)
      } catch {
        setIsInstagramIOS(true)
      }
    }
  }, [url])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      setCopied(false)
    }
  }

  if (isInstagramIOS) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center space-y-7">
          <div className="text-4xl">🌐</div>

          <div>
            <h1 className="text-xl font-bold mb-2">In Safari öffnen</h1>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Instagram blockiert externe Links. So kommst du raus:
            </p>
          </div>

          {/* Schritt-für-Schritt */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-left space-y-4">
            <Step number={1} text='Tippe unten rechts auf "···" (drei Punkte)' />
            <Step number={2} text='"In Safari öffnen" wählen' />
            <Step number={3} text="Fertig — du bist im richtigen Browser!" />
          </div>

          <div className="space-y-3">
            <p className="text-zinc-500 text-xs">Oder Link kopieren und in Safari einfügen:</p>
            <button
              onClick={copyLink}
              className="w-full bg-white text-black font-semibold py-3.5 rounded-xl transition-colors hover:bg-zinc-200 active:bg-zinc-300"
            >
              {copied ? '✓ Link kopiert!' : 'Link kopieren'}
            </button>
          </div>
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

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-white text-black text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
        {number}
      </div>
      <p className="text-zinc-300 text-sm">{text}</p>
    </div>
  )
}
