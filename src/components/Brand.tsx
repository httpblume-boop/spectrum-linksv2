export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg shadow-purple-900/50"
      style={{ width: size, height: size }}
    >
      <span className="text-white font-black" style={{ fontSize: size * 0.55 }}>S</span>
    </div>
  )
}

export function BrandHeader() {
  return (
    <div className="flex items-center gap-3">
      <BrandMark size={36} />
      <div>
        <p className="text-white font-bold text-lg leading-tight">Spectrum</p>
        <p className="text-purple-300/60 text-xs leading-tight tracking-wider uppercase">Studios</p>
      </div>
    </div>
  )
}
