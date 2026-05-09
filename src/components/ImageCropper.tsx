'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Loader2 } from 'lucide-react'

type CropArea = { x: number; y: number; width: number; height: number }

type Props = {
  imageSrc: string
  aspect: number
  onComplete: (croppedBlob: Blob) => void
  onCancel: () => void
}

async function getCroppedImage(imageSrc: string, pixelCrop: CropArea): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', reject)
    img.src = imageSrc
  })

  const canvas = document.createElement('canvas')
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext('2d')!

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0,
    pixelCrop.width, pixelCrop.height
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Canvas is empty'))
    }, 'image/jpeg', 0.92)
  })
}

export default function ImageCropper({ imageSrc, aspect, onComplete, onCancel }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null)
  const [loading, setLoading] = useState(false)

  const onCropComplete = useCallback((_: unknown, croppedPixels: CropArea) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  async function handleConfirm() {
    if (!croppedAreaPixels) return
    setLoading(true)
    const blob = await getCroppedImage(imageSrc, croppedAreaPixels)
    onComplete(blob)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col" style={{ zIndex: 9999 }}>
      <div className="relative" style={{ height: '70vh' }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      {/* Zoom Slider */}
      <div className="bg-zinc-900 px-6 py-4 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="text-zinc-400 text-sm w-12">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-white"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Ausschnitt übernehmen
          </button>
          <button
            onClick={onCancel}
            className="px-5 text-zinc-400 hover:text-white transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  )
}
