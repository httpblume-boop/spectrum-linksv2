type Props = {
  creatorName: string
  bannerUrl?: string
}

export default function InstagramBreakout({ creatorName, bannerUrl }: Props) {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', color: '#fff', background: '#030712', fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif', overflow: 'hidden', position: 'relative' }}>
      {/* Callout oben rechts */}
      <div style={{ position: 'fixed', top: 8, right: 12, zIndex: 50 }}>
        <div style={{ position: 'relative', background: '#fff', color: '#111827', borderRadius: 12, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: 12, fontWeight: 500, lineHeight: 1.4, textAlign: 'center', maxWidth: 130, animation: 'shake 2.4s ease-in-out infinite' }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 2 }}>
            Tippe <strong style={{ letterSpacing: 2, fontSize: 14 }}>•••</strong>
          </span>
          <span>um im Browser zu öffnen</span>
        </div>
      </div>

      {/* Hero */}
      <div style={{ position: 'relative', width: '100%', height: '38dvh', flexShrink: 0 }}>
        {bannerUrl && (
          <img src={bannerUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 55%, #030712 100%)' }} />
      </div>

      {/* Main */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 384, margin: '-32px auto 0', padding: '0 24px 24px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>{creatorName}</h1>

        <div style={{ padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 16 }}>Im Browser öffnen um fortzufahren</p>

          <div style={{ textAlign: 'left', marginBottom: 16 }}>
            <Step number={1} text={<>Tippe oben rechts auf <strong style={{ color: '#fff' }}>•••</strong></>} />
            <Step number={2} text={<>Wähle <strong style={{ color: '#fff' }}>„In Safari öffnen"</strong></>} />
            <Step number={3} text="Fertig — du siehst dann die Inhalte" />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `@keyframes shake{0%,88%,100%{transform:translateX(0)}90%,94%{transform:translateX(-5px)}92%,96%{transform:translateX(5px)}}` }} />
    </div>
  )
}

function Step({ number, text }: { number: number; text: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
      <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.1)', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 }}>{number}</span>
      <p style={{ fontSize: 14, color: '#9ca3af', paddingTop: 2 }}>{text}</p>
    </div>
  )
}
