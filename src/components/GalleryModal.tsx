'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { GalleryImage } from '@/lib/supabase'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  images: GalleryImage[]
  startIndex: number
  onClose: () => void
}

export default function GalleryModal({ images, startIndex, onClose }: Props) {
  const [current, setCurrent] = useState(startIndex)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setCurrent((i) => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setCurrent((i) => Math.min(images.length - 1, i + 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [images.length, onClose])

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
        <X size={28} />
      </button>

      <button
        onClick={() => setCurrent((i) => Math.max(0, i - 1))}
        disabled={current === 0}
        className="absolute left-3 text-white/70 hover:text-white disabled:opacity-20"
      >
        <ChevronLeft size={36} />
      </button>

      <div className="relative w-full max-w-lg mx-14 aspect-[3/4]">
        <Image
          src={images[current].image_url}
          alt=""
          fill
          className="object-contain"
        />
      </div>

      <button
        onClick={() => setCurrent((i) => Math.min(images.length - 1, i + 1))}
        disabled={current === images.length - 1}
        className="absolute right-3 text-white/70 hover:text-white disabled:opacity-20"
      >
        <ChevronRight size={36} />
      </button>

      <div className="absolute bottom-4 text-zinc-500 text-sm">
        {current + 1} / {images.length}
      </div>
    </div>
  )
}
