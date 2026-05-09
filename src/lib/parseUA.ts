// Einfacher User-Agent Parser für Device + Browser
export function parseDevice(ua: string): string {
  if (/iPad|Tablet/i.test(ua)) return 'tablet'
  if (/Mobile|Android|iPhone/i.test(ua)) return 'mobile'
  return 'desktop'
}

export function parseBrowser(ua: string): string {
  if (/Instagram/i.test(ua)) return 'instagram'
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return 'facebook'
  if (/TikTok/i.test(ua)) return 'tiktok'
  if (/Snapchat/i.test(ua)) return 'snapchat'
  if (/Edg\//i.test(ua)) return 'edge'
  if (/OPR\//i.test(ua)) return 'opera'
  if (/Firefox/i.test(ua)) return 'firefox'
  if (/Chrome/i.test(ua)) return 'chrome'
  if (/Safari/i.test(ua)) return 'safari'
  return 'other'
}
