-- ============================================================
-- Seed: purchases
--
-- Users (tourists):
--   ana         = a1b2c3d4-0001-4000-8000-000000000001
--   jovana      = a1b2c3d4-0003-4000-8000-000000000003
--   milica      = a1b2c3d4-0005-4000-8000-000000000005
--   nikola      = a1b2c3d4-0006-4000-8000-000000000006
--   aleksandar  = a1b2c3d4-0008-4000-8000-000000000008
--   katarina    = a1b2c3d4-0009-4000-8000-000000000009
--
-- Tours (Published):
--   Novi Sad Old Town Walk          = c1000000-0001-4000-8000-000000000001  (price 12.00)
--   Petrovaradin Fortress Deep Dive = c1000000-0002-4000-8000-000000000002  (price 18.00)
--   Tara Canyon Hike                = c1000000-0004-4000-8000-000000000004  (price 35.00)
--   Kopaonik Summit Trail           = c1000000-0005-4000-8000-000000000005  (price 40.00)
--   Đavolja Varoš Mystery Tour      = c1000000-0006-4000-8000-000000000006  (price 22.00)
--   Fruška Gora Wine & Monastery    = c1000000-0007-4000-8000-000000000007  (price 45.00)
--   Belgrade Food Market Crawl      = c1000000-0008-4000-8000-000000000008  (price 20.00)
--   Zemun Waterfront & Gardoš Tower = c1000000-0010-4000-8000-000000000010  (price 15.00)
--   Danube Sunset Cruise & Panorama = c1000000-0011-4000-8000-000000000011  (price 30.00)
--   Great War Island Bird Watching  = c1000000-0012-4000-8000-000000000012  (price 28.00)
-- ============================================================

BEGIN;

INSERT INTO public.purchases (id, user_id, tour_id, tour_name, tour_description, price, token, created_at) VALUES

  -- ── Ana ──────────────────────────────────────────────────────────────────────
  (
    'f0000000-0001-4000-8000-000000000001',
    'a1b2c3d4-0001-4000-8000-000000000001',
    'c1000000-0001-4000-8000-000000000001',
    'Novi Sad Old Town Walk',
    'A leisurely stroll through the historic core of Novi Sad — from the Dunavska street cafes to the iconic Name of Mary Church and the lively Zmaj Jovina boulevard.',
    12.00,
    'TOKEN-ANA-NOVISAD-OLDTOWN-001',
    '2024-04-08 10:00:00+00'
  ),
  (
    'f0000000-0001-4000-8000-000000000002',
    'a1b2c3d4-0001-4000-8000-000000000001',
    'c1000000-0002-4000-8000-000000000002',
    'Petrovaradin Fortress Deep Dive',
    'Explore the underground tunnels, ramparts, and rich military history of the "Gibraltar on the Danube". Includes a visit to the clock tower and panoramic river views.',
    18.00,
    'TOKEN-ANA-PETROVARADIN-002',
    '2024-05-16 09:00:00+00'
  ),

  -- ── Jovana ───────────────────────────────────────────────────────────────────
  (
    'f0000000-0002-4000-8000-000000000001',
    'a1b2c3d4-0003-4000-8000-000000000003',
    'c1000000-0004-4000-8000-000000000004',
    'Tara Canyon Hike',
    'A full-day guided hike along the rim of the Tara River Canyon — one of the deepest gorges in Europe. Stunning viewpoints and old-growth forest throughout.',
    35.00,
    'TOKEN-JOVANA-TARA-001',
    '2024-06-13 08:00:00+00'
  ),
  (
    'f0000000-0002-4000-8000-000000000002',
    'a1b2c3d4-0003-4000-8000-000000000003',
    'c1000000-0006-4000-8000-000000000006',
    'Đavolja Varoš Mystery Tour',
    'Visit the eerie natural rock formations of Devil''s Town — over 200 stone figures carved by erosion, with legends of cursed wedding guests woven throughout.',
    22.00,
    'TOKEN-JOVANA-DJAVOLJA-002',
    '2024-06-20 09:00:00+00'
  ),

  -- ── Milica ───────────────────────────────────────────────────────────────────
  (
    'f0000000-0003-4000-8000-000000000001',
    'a1b2c3d4-0005-4000-8000-000000000005',
    'c1000000-0007-4000-8000-000000000007',
    'Fruška Gora Wine & Monastery Trail',
    'Combine spirituality and gastronomy: visit two medieval monasteries on Fruška Gora then finish the day with a guided tasting at a family-owned winery.',
    45.00,
    'TOKEN-MILICA-FRUSKAGORA-001',
    '2024-05-23 10:00:00+00'
  ),
  (
    'f0000000-0003-4000-8000-000000000002',
    'a1b2c3d4-0005-4000-8000-000000000005',
    'c1000000-0005-4000-8000-000000000005',
    'Kopaonik Summit Trail',
    'Reach the highest peak of Kopaonik National Park. The route passes through pine forests, alpine meadows, and ski resort infrastructure on the way to Pančićev vrh.',
    40.00,
    'TOKEN-MILICA-KOPAONIK-002',
    '2024-07-26 07:00:00+00'
  ),

  -- ── Nikola ───────────────────────────────────────────────────────────────────
  (
    'f0000000-0004-4000-8000-000000000001',
    'a1b2c3d4-0006-4000-8000-000000000006',
    'c1000000-0012-4000-8000-000000000012',
    'Great War Island Bird Watching',
    'A zodiac boat excursion to Veliko Ratno Ostrvo — a protected nature reserve at the confluence of the Sava and Danube — for bird watching and wetland ecology.',
    28.00,
    'TOKEN-NIKOLA-GREATWAR-001',
    '2024-07-30 08:00:00+00'
  ),
  (
    'f0000000-0004-4000-8000-000000000002',
    'a1b2c3d4-0006-4000-8000-000000000006',
    'c1000000-0008-4000-8000-000000000008',
    'Belgrade Food Market Crawl',
    'From Zeleni Venac market to the Michelin-recommended kafanas of Skadarlija — taste traditional rakija, roštilj, and seasonal street food on this half-day culinary walk.',
    20.00,
    'TOKEN-NIKOLA-FOODCRAWL-002',
    '2024-07-02 10:00:00+00'
  ),

  -- ── Aleksandar ───────────────────────────────────────────────────────────────
  (
    'f0000000-0005-4000-8000-000000000001',
    'a1b2c3d4-0008-4000-8000-000000000008',
    'c1000000-0010-4000-8000-000000000010',
    'Zemun Waterfront & Gardoš Tower',
    'Walk the cobblestone quay of Zemun, hear stories of its Austro-Hungarian past, and climb the Millennium Tower on Gardoš Hill for sweeping Danube views.',
    15.00,
    'TOKEN-ALEX-ZEMUN-001',
    '2024-04-18 09:00:00+00'
  ),
  (
    'f0000000-0005-4000-8000-000000000002',
    'a1b2c3d4-0008-4000-8000-000000000008',
    'c1000000-0011-4000-8000-000000000011',
    'Danube Sunset Cruise & Belgrade Panorama',
    'Board a traditional river boat at Zemun quay, cruise past Ada Ciganlija and the old Belgrade fortress, and watch the sun set over two rivers.',
    30.00,
    'TOKEN-ALEX-DANUBE-002',
    '2024-05-08 14:00:00+00'
  ),

  -- ── Katarina ─────────────────────────────────────────────────────────────────
  (
    'f0000000-0006-4000-8000-000000000001',
    'a1b2c3d4-0009-4000-8000-000000000009',
    'c1000000-0005-4000-8000-000000000005',
    'Kopaonik Summit Trail',
    'Reach the highest peak of Kopaonik National Park. The route passes through pine forests, alpine meadows, and ski resort infrastructure on the way to Pančićev vrh.',
    40.00,
    'TOKEN-KATARINA-KOPAONIK-001',
    '2024-07-18 08:00:00+00'
  );

COMMIT;