-- TickWatch UK: community sighting reports. Run in the Supabase SQL editor.
create table if not exists public.sighting_reports (
  id                   uuid primary key,
  created_at           timestamptz not null default now(),
  occurred_at          timestamp   not null check (occurred_at <= now() and occurred_at >= '2000-01-01'),
  city                 text        not null check (char_length(city) between 2 and 60),
  species              text        not null check (char_length(species) between 2 and 60),
  latin_name           text        not null default '',
  lat                  double precision not null check (lat between 49.8 and 60.9),
  lng                  double precision not null check (lng between -8.7 and 1.8),
  approximate_location boolean     not null default true,
  description          text        not null default '' check (char_length(description) <= 500),
  photo_path           text,
  photo_name           text,
  photo_type           text check (photo_type in ('image/jpeg','image/png','image/webp')),
  photo_size           integer check (photo_size <= 5242880)
);

alter table public.sighting_reports enable row level security;

-- Anonymous visitors may add and read reports. No update or delete policy exists, so they are denied.
create policy "reports are readable" on public.sighting_reports for select to anon using (true);
create policy "reports can be added" on public.sighting_reports for insert to anon with check (true);

-- Photo bucket: public read, 5 MB, images only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('report-photos', 'report-photos', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "photos can be uploaded" on storage.objects for insert to anon
  with check (bucket_id = 'report-photos');
create policy "photos are readable" on storage.objects for select to anon
  using (bucket_id = 'report-photos');
