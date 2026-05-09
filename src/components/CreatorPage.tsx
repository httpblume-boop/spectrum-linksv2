'use client'

import { useState } from 'react'
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

  function handleOFClick() {
    setShowAgeModal(true)
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creator_id: creator.id, link_type: 'of_link' }),
    })
  }

  function handleOFConfirm() {
    setShowAgeModal(false)

    // OF Link via Function() konstruieren — versteckt vor IG-Crawler
    const ofUrl = (new Function(`return '${creator.of_link}'`))() as string

    const ua = navigator.userAgent
    const isInstagram = ua.includes('Instagram')
    const isAndroid = ua.includes('Android')

    // Android Instagram → Intent öffnet Chrome direkt
    if (isInstagram && isAndroid) {
      const stripped = ofUrl.replace(/^https?:\/\//, '')
      window.location.href = `intent://${stripped}#Intent;scheme=https;package=com.android.chrome;end`
      return
    }

    // iOS / Desktop / alle anderen → echter Anchor-Click im User-Click-Kontext
    // Das umgeht Instagrams iOS-Browser am zuverlässigsten
    const a = document.createElement('a')
    a.href = ofUrl
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
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

      {/* OF Card */}
      <div className="w-full max-w-lg px-5 mt-6">
        <button
          onClick={handleOFClick}
          className="relative w-full rounded-2xl overflow-hidden cursor-pointer group"
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
        </button>
      </div>

      {/* Zusätzliche Links */}
      {links.length > 0 && (
        <div className="w-full max-w-lg px-5 mt-4 flex flex-col gap-3">
          {links.map((link) => (
            <LinkButton key={link.id} link={link} creatorId={creator.id} />
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
        onConfirm={handleOFConfirm}
        onCancel={() => setShowAgeModal(false)}
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
