-- Analytics Erweiterung: mehr Tracking-Daten

-- Page Views Tabelle (separates Tracking für Besuche)
create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references creators(id) on delete cascade,
  viewed_at timestamptz default now(),
  country text,
  device text,        -- 'mobile' | 'tablet' | 'desktop'
  browser text,       -- 'safari' | 'chrome' | 'instagram' etc.
  user_agent text,
  referer text
);

create index if not exists page_views_creator_time on page_views (creator_id, viewed_at);
create index if not exists page_views_country on page_views (country);

-- Click Events erweitern
alter table click_events add column if not exists country text;
alter table click_events add column if not exists device text;
alter table click_events add column if not exists browser text;

create index if not exists click_events_country on click_events (country);

-- Public Insert Policy für Page Views
alter table page_views enable row level security;
create policy "public insert page_views" on page_views for insert with check (true);
