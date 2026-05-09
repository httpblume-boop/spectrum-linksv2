'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import ImageCropper from './ImageCropper'

type Props = {
  label: string
  value: string
  onChange: (url: string) => void
  aspect?: 'banner' | 'square' | 'card'
}

const ASPECT_RATIOS = {
  banner: 3 / 1,
  square: 1,
  card: 16 / 9,
}

const ASPECT_CLASSES = {
  banner: 'aspect-[3/1]',
  square: 'aspect-square',
  card: 'aspect-[16/9]',
}

export default function ImageUpload({ label, value, onChange, aspect = 'square' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cropSrc, setCropSrc] = useState<string | null>(null)

  async function uploadBlob(blob: Blob) {
    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', blob, 'image.jpg')

    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Upload fehlgeschlagen')
    } else {
      onChange(data.url)
    }
    setLoading(false)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const objectUrl = URL.createObjectURL(file)
    setCropSrc(objectUrl)
    e.target.value = ''
  }

  async function handleCropComplete(blob: Blob) {
    setCropSrc(null)
    await uploadBlob(blob)
  }

  return (
    <>
      <div className="space-y-1.5">
        {label && <span className="text-sm text-purple-300/70">{label}</span>}
        <div
          className={`relative w-full ${ASPECT_CLASSES[aspect]} rounded-xl overflow-hidden border border-purple-900/40 bg-[#1f1638]/60 cursor-pointer group`}
          onClick={() => !loading && inputRef.current?.click()}
        >
          {value ? (
            <>
              <Image src={value} alt="" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1 text-white">
                  <Upload size={20} />
                  <span className="text-xs">Ersetzen</span>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange('') }}
                className="absolute top-2 right-2 bg-black/60 rounded-full p-1 text-white hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-purple-300/50 hover:text-purple-200 transition-colors">
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <Upload size={24} />
                  <span className="text-xs">Bild auswählen</span>
                </>
              )}
            </div>
          )}
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {cropSrc && (
        <ImageCropper
          imageSrc={cropSrc}
          aspect={ASPECT_RATIOS[aspect]}
          onComplete={handleCropComplete}
          onCancel={() => setCropSrc(null)}
        />
      )}
    </>
  )
}
