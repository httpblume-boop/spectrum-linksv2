'use client'

import Image from 'next/image'

type Props = {
  name: string
  handle: string
  bio: string
  bannerUrl: string
  avatarUrl: string
  ofCardImageUrl: string
  ofCardTitle: string
  links: Array<{ title?: string; url?: string; icon?: string }>
  gallery: string[]
}

export default function PhonePreview(props: Props) {
  return (
    <div className="hidden lg:block lg:sticky lg:top-6">
      <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3 text-center">
        Live Vorschau
      </p>

      {/* iPhone Frame */}
      <div className="mx-auto" style={{ width: 320 }}>
        <div className="relative rounded-[44px] bg-zinc-900 p-2 shadow-2xl border border-zinc-800">
          <div className="relative rounded-[36px] overflow-hidden bg-black" style={{ width: 304, height: 640 }}>
            {/* Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-30" />

            {/* Content (scrollable) */}
            <div className="w-full h-full overflow-y-auto bg-black scrollbar-hide">
              <PreviewContent {...props} />
            </div>
          </div>
        </div>
        <p className="text-center text-zinc-600 text-xs mt-3">
          So sieht die Seite live aus
        </p>
      </div>
    </div>
  )
}

function PreviewContent({
  name, handle, bio, bannerUrl, avatarUrl, ofCardImageUrl, ofCardTitle, links, gallery,
}: Props) {
  const validLinks = links.filter((l) => l.title && l.url)
  const validGallery = gallery.filter(Boolean)

  return (
    <div className="text-white flex flex-col items-center min-h-full">
      {/* Banner */}
      <div className="relative w-full h-44 flex-shrink-0">
        {bannerUrl ? (
          <Image src={bannerUrl} alt="" fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-zinc-800 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
      </div>

      {/* Profil */}
      <div className="w-full px-4 -mt-10 relative z-10 flex flex-col items-center text-center">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            width={56}
            height={56}
            className="rounded-full border-2 border-white object-cover mb-2"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-zinc-700 border-2 border-white mb-2" />
        )}
        <h1 className="text-lg font-bold">{name || 'Name'}</h1>
        {handle && <p className="text-zinc-400 text-xs mt-0.5">@{handle}</p>}
        {bio && <p className="text-zinc-300 text-xs mt-2 max-w-[260px]">{bio}</p>}
      </div>

      {/* OF Card */}
      <div className="w-full px-4 mt-4">
        <div className="relative w-full rounded-xl overflow-hidden">
          {ofCardImageUrl ? (
            <Image
              src={ofCardImageUrl}
              alt=""
              width={400}
              height={220}
              className="w-full h-36 object-cover"
            />
          ) : (
            <div className="w-full h-36 bg-gradient-to-br from-zinc-800 to-zinc-900" />
          )}
          {ofCardTitle && (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-0 right-0 text-center px-3">
                <p className="text-white font-bold text-sm drop-shadow">{ofCardTitle}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Links */}
      {validLinks.length > 0 && (
        <div className="w-full px-4 mt-3 flex flex-col gap-2">
          {validLinks.map((link, i) => (
            <div
              key={i}
              className="w-full text-center bg-zinc-800 border border-zinc-700 text-white text-xs font-medium py-2.5 rounded-lg"
            >
              {link.title}
            </div>
          ))}
        </div>
      )}

      {/* Galerie */}
      {validGallery.length > 0 && (
        <div className="w-full px-4 mt-5 pb-6">
          <h2 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">
            Galerie
          </h2>
          <div className="grid grid-cols-3 gap-1">
            {validGallery.map((url, i) => (
              <div key={i} className="relative aspect-square rounded overflow-hidden">
                <Image src={url} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="h-6" />
    </div>
  )
}
