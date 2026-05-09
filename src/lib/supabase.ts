import { createClient, SupabaseClient } from '@supabase/supabase-js'

export type Creator = {
  id: string
  slug: string
  name: string
  handle: string
  bio: string
  banner_url: string
  avatar_url: string
  of_link: string
  of_card_image_url: string
  of_card_title: string
  active: boolean
  created_at: string
}

export type Link = {
  id: string
  creator_id: string
  title: string
  url: string
  icon: string
  sort_order: number
  js_redirect: boolean
  active: boolean
}

export type GalleryImage = {
  id: string
  creator_id: string
  image_url: string
  sort_order: number
}

export type ClickEvent = {
  id: string
  creator_id: string
  link_type: string
  link_id: string | null
  clicked_at: string
  user_agent: string | null
  referer: string | null
}

let _supabase: SupabaseClient | null = null
let _service: SupabaseClient | null = null

export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _supabase
}

export function getServiceClient() {
  if (!_service) {
    _service = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _service
}

// Singleton für Client-Components
export const supabase = {
  from: (...args: Parameters<SupabaseClient['from']>) => getSupabase().from(...args),
}
