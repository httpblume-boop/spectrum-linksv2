export default function BlockedPage() {
  return (
    <div className="min-h-screen bg-[#0a0612] text-white flex items-center justify-center px-5 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative text-center max-w-sm">
        <div className="text-5xl mb-6">🌍</div>
        <h1 className="text-2xl font-bold mb-3">Nicht verfügbar</h1>
        <p className="text-purple-300/60">
          Dieser Inhalt ist in deiner Region leider nicht verfügbar.
        </p>
      </div>
    </div>
  )
}
