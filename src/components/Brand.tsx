import Image from 'next/image'

export function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <div
      className="relative rounded-xl overflow-hidden shadow-lg shadow-purple-900/50 flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo.png"
        alt="Spectrum Studios"
        width={size}
        height={size}
        className="object-cover"
      />
    </div>
  )
}

export function BrandHeader() {
  return (
    <div className="flex items-center gap-3">
      <BrandMark size={40} />
      <div>
        <p className="text-white font-bold text-lg leading-tight">Spectrum</p>
        <p className="text-purple-300/60 text-xs leading-tight tracking-[0.2em] uppercase">Studios</p>
      </div>
    </div>
  )
}
