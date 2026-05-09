'use client'

type Props = {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function AgeModal({ open, onConfirm, onCancel }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-5">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-7 max-w-sm w-full text-center shadow-2xl">
        <div className="text-4xl mb-4">🔞</div>
        <h2 className="text-xl font-bold text-white mb-2">Altersverifikation</h2>
        <p className="text-zinc-400 text-sm mb-6">
          Diese Seite enthält Inhalte, die nur für Personen ab 18 Jahren geeignet sind.
          Bitte bestätige dein Alter um fortzufahren.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-200 transition-colors"
          >
            Ich bin 18+ Jahre alt
          </button>
          <button
            onClick={onCancel}
            className="w-full text-zinc-500 text-sm py-2 hover:text-zinc-300 transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  )
}
