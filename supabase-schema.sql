-- Creators
create table creators (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  handle text not null,
  bio text,
  banner_url text,
  avatar_url text,
  of_link text,
  of_card_image_url text,
  of_card_title text default 'Das Abenteuer wartet 🤫',
  active boolean default true,
  created_at timestamptz default now()
);

-- Links (zusätzliche Links wie Instagram, Telegram etc.)
create table links (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references creators(id) on delete cascade,
  title text not null,
  url text not null,
  icon text default 'link',
  sort_order int default 0,
  js_redirect boolean default false,
  active boolean default true
);

-- Galerie-Bilder
create table gallery_images (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references creators(id) on delete cascade,
  image_url text not null,
  sort_order int default 0
);

-- Analytics / Click Tracking
create table click_events (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references creators(id) on delete cascade,
  link_type text not null, -- 'of_link' | 'link' | 'gallery'
  link_id uuid references links(id) on delete set null,
  clicked_at timestamptz default now(),
  user_agent text,
  referer text
);

-- Indexes für Performance
create index on click_events (creator_id, clicked_at);
create index on click_events (link_type, clicked_at);

-- Row Level Security (public read für creator pages)
alter table creators enable row level security;
alter table links enable row level security;
alter table gallery_images enable row level security;
alter table click_events enable row level security;

create policy "public read creators" on creators for select using (active = true);
create policy "public read links" on links for select using (active = true);
create policy "public read gallery" on gallery_images for select using (true);
create policy "public insert clicks" on click_events for insert with check (true);
