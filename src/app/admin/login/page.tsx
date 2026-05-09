'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BrandHeader } from '@/components/Brand'
import Footer from '@/components/Footer'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/admin')
    } else {
      setError('Falsches Passwort')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0612] text-white flex flex-col items-center justify-center px-5 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-900/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <BrandHeader />
        </div>

        <div className="bg-[#16102b]/80 backdrop-blur border border-purple-900/40 rounded-2xl p-8 shadow-2xl shadow-purple-950/50">
          <h1 className="text-xl font-bold text-white mb-1">Admin Login</h1>
          <p className="text-purple-300/50 text-sm mb-6">Nur für Spectrum Mitarbeiter</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="bg-[#1f1638]/60 border border-purple-900/40 text-white rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-colors"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-purple-900/50"
            >
              Einloggen
            </button>
          </form>
        </div>
      </div>

      <div className="relative mt-8">
        <Footer />
      </div>
    </div>
  )
}
