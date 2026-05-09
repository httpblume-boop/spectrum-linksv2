export default function BlockedPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-5">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-6">🌍</div>
        <h1 className="text-2xl font-bold mb-3">Nicht verfügbar</h1>
        <p className="text-zinc-400">
          Dieser Inhalt ist in deiner Region leider nicht verfügbar.
        </p>
      </div>
    </div>
  )
}
