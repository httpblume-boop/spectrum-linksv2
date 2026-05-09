import { requireAdmin } from '@/lib/auth'
import CreatorForm from '@/components/CreatorForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewCreatorPage() {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/admin" className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm">
          <ArrowLeft size={16} /> Zurück
        </Link>
        <h1 className="text-2xl font-bold mb-8">Neuen Creator erstellen</h1>
        <CreatorForm />
      </div>
    </div>
  )
}
