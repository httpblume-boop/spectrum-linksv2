'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Creator, Link, GalleryImage } from '@/lib/supabase'
import AgeModal from './AgeModal'
import GalleryModal from './GalleryModal'
import LinkButton from './LinkButton'

type Props = {
  creator: Creator
  links: Link[]
  gallery: GalleryImage[]
}

export default function CreatorPage({ creator, links, gallery }: Props) {
  const [showAgeModal, setShowAgeModal] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null)
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [pendingUrl, setPendingUrl] = useState<string | null>(null)

  useEffect(() => {
    try {
      if (sessionStorage.getItem('age_confirmed') === '1') {
        setAgeConfirmed(true)
      }
    } catch {}
  }, [])

  function handleOFCardClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (ageConfirmed) {
      // Echter Anchor-Click läuft durch — escaped IG iOS-Browser
      return
    }
    e.preventDefault()
    setPendingUrl(e.currentTarget.href)
    setShowAgeModal(true)
  }

  function handleAgeConfirm() {
    const url = pendingUrl
    setShowAgeModal(false)
    setAgeConfirmed(true)
    setPendingUrl(null)
    try { sessionStorage.setItem('age_confirmed', '1') } catch {}

    // window.open im User-Click-Kontext — wie Kollegen-Implementation
    if (url) {
      window.open(url, '_blank', 'noreferrer,noopener')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">
      {/* Banner */}
      <div className="relative w-full max-w-lg h-72 sm:h-96">
        {creator.banner_url ? (
          <Image
            src={creator.banner_url}
            alt="banner"
            fill
            className="object-cover object-top"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-zinc-800 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
      </div>

      {/* Profil */}
      <div className="w-full max-w-lg px-5 -mt-16 relative z-10 flex flex-col items-center text-center">
        {creator.avatar_url && (
          <Image
            src={creator.avatar_url}
            alt={creator.name}
            width={80}
            height={80}
            className="rounded-full border-2 border-white object-cover mb-3"
          />
        )}
        <h1 className="text-2xl font-bold">{creator.name}</h1>
        <p className="text-zinc-400 text-sm mt-1">@{creator.handle}</p>
        {creator.bio && (
          <p className="text-zinc-300 text-sm mt-3 max-w-xs">{creator.bio}</p>
        )}
      </div>

      {/* OF Card — echter <a> Tag mit target="_blank" */}
      <div className="w-full max-w-lg px-5 mt-6">
        <a
          href={`/r/${creator.slug}/of`}
          target="_blank"
          rel="noopener noreferrer"
          referrerPolicy="no-referrer"
          onClick={handleOFCardClick}
          className="relative w-full block rounded-2xl overflow-hidden cursor-pointer group"
        >
          {creator.of_card_image_url ? (
            <Image
              src={creator.of_card_image_url}
              alt="OF Card"
              width={600}
              height={340}
              className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-52 bg-gradient-to-br from-zinc-800 to-zinc-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <p className="text-white font-bold text-lg drop-shadow">{creator.of_card_title}</p>
          </div>
        </a>
      </div>

      {/* Zusätzliche Links */}
      {links.length > 0 && (
        <div className="w-full max-w-lg px-5 mt-4 flex flex-col gap-3">
          {links.map((link) => (
            <LinkButton key={link.id} link={link} creator={creator} />
          ))}
        </div>
      )}

      {/* Galerie */}
      {gallery.length > 0 && (
        <div className="w-full max-w-lg px-5 mt-8 pb-12">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-3">
            Galerie
          </h2>
          <div className="grid grid-cols-3 gap-1.5">
            {gallery.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setGalleryIndex(i)}
                className="relative aspect-square rounded-lg overflow-hidden group"
              >
                <Image
                  src={img.image_url}
                  alt=""
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <AgeModal
        open={showAgeModal}
        onConfirm={handleAgeConfirm}
        onCancel={() => { setShowAgeModal(false); setPendingUrl(null) }}
      />
      {galleryIndex !== null && (
        <GalleryModal
          images={gallery}
          startIndex={galleryIndex}
          onClose={() => setGalleryIndex(null)}
        />
      )}
    </div>
  )
}
