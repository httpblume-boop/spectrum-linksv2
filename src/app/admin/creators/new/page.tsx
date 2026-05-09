import { requireAdmin } from '@/lib/auth'
import CreatorForm from '@/components/CreatorForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { BrandHeader } from '@/components/Brand'
import Footer from '@/components/Footer'

export default async function NewCreatorPage() {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-[#0a0612] text-white relative">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-950/30 via-transparent to-purple-900/10 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin" className="flex items-center gap-2 text-purple-300/70 hover:text-white text-sm transition-colors">
            <ArrowLeft size={16} /> Zurück zum Dashboard
          </Link>
          <BrandHeader />
        </div>

        <h1 className="text-2xl font-bold mb-8">Neuen Creator erstellen</h1>
        <CreatorForm />

        <Footer />
      </div>
    </div>
  )
}
