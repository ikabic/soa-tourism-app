BEGIN;
  --
  -- Blogs
  --

  INSERT INTO public.blog_posts (id, author_id, created_at, description, image_urls, likes_count, title) VALUES
  (
    'c1d2e3f4-0001-4000-8000-200000000001',
    'a1b2c3d4-0002-4000-8000-000000000002',
    '2026-04-10 10:00:00',
    '## Novi Sad Up Close

     Last week I guided a group through the Petrovaradin Fortress, and every time I am amazed again by the view of the Danube from the upper walls.

     The tour starts at Liberty Square, passes through Zmaj Jovina Street, and ends at the fortress where tourists can see the clock with the "wrong" hands.

     Tips for visitors:
     - Arrive early in the morning to avoid crowds
     - Wear comfortable shoes
     - Make sure to visit the underground tunnels',
      'https://picsum.photos/seed/petrovaradin/800/400',
       12,
      'Secrets of the Petrovaradin Fortress'
  ),
  (
    'c1d2e3f4-0002-4000-8000-200000000002',
    'a1b2c3d4-0004-4000-8000-000000000004',
    '2026-04-15 14:30:00',
    '## Kopaonik Off-Season

     Many people think Kopaonik is only a winter destination, but spring in Kopaonik is something special.

     Mountain flora blooms from May, the trails are peaceful, and accommodation prices are twice as low as in winter.

     Recommended trails:
     1. Suvo Rudište - Pančić Peak (easy, 2h)
     2. Brzeće - Karaman Ridge (medium, 4h)
     3. Kula - Srebrnac (hard, 6h)

    Always check weather conditions before departure.',
    'https://picsum.photos/seed/kopaonik-spring/800/400',
     8,
    'Kopaonik in Spring - Forgotten Beauty'
  ),
  (
    'c1d2e3f4-0003-4000-8000-200000000003',
    'a1b2c3d4-0007-4000-8000-000000000007',
    '2026-04-20 09:15:00',
    '## Wine Tour Through Fruška Gora

     Fruška Gora hides 16 monasteries and dozens of vineyards producing some of the best Serbian wines.

    On my last tour we visited:
    - Krušedol Monastery - founded in 1509
    - Kovačević Winery - excellent Chardonnay and Tamjanika
    - Novo Hopovo Monastery - 17th century frescoes

    Recommendation: Kutjevo Graševina with local cheese is a combination you must try!',
    'https://picsum.photos/seed/fruska-gora-wine/800/400',
     15,
    'Fruška Gora - Monasteries and Wine'
  ),
  (
    'c1d2e3f4-0004-4000-8000-200000000004',
    'a1b2c3d4-0010-4000-8000-000000000010',
    '2026-05-01 11:00:00',
    '## Danube Cruise Through Zemun

    Zemun is one of the rare parts of Belgrade that has preserved its Austro-Hungarian charm. From the Gardoš Tower, the view stretches all the way to the confluence of the Sava and Danube rivers.

    My cruise includes:
    - Departure below the Liberation Quay
    - Passing by War Island
    - Stop at Great War Island (June-September)
    - Return during sunset

    Duration: 2.5 hours | Price: €25 per person',
    'https://picsum.photos/seed/zemun-danube/800/400',
     20,
    'The Danube from Another Perspective - Cruise Through Zemun'
  ),
  (
    'c1d2e3f4-0005-4000-8000-200000000005',
    'a1b2c3d4-0002-4000-8000-000000000002',
    '2026-05-05 16:00:00',
    '## What to Bring on a Tour?

    After years of guiding tours, here is my checklist for perfect preparation:

    Basic equipment:
    - Comfortable shoes (not sandals!)
    - Hat and sunscreen
    - Phone charger
    - Small bag, not a suitcase

    Documents:
    - ID card
    - Health insurance card
    - Guide contact information

    Tips:
    > Always tell someone where you are going and when you are returning.

    Good luck and enjoy exploring!',
    'https://picsum.photos/seed/tour-checklist/800/400',
     6,
    'Preparation Guide - What to Bring on a Tour'
  );

--
-- Comments
--

INSERT INTO public.comments (id, author_id, blog_post_id, content, created_at, updated_at) VALUES
  (
    'd1e2f3a4-0001-4000-8000-300000000001',
    'a1b2c3d4-0001-4000-8000-000000000001',
    'c1d2e3f4-0001-4000-8000-200000000001',
    'I went on this tour last month and the tunnels are truly amazing! I recommend it to everyone.',
    '2026-04-11 12:00:00',
    '2026-04-11 12:00:00'
  ),
  (
    'd1e2f3a4-0002-4000-8000-300000000002',
    'a1b2c3d4-0005-4000-8000-000000000005',
    'c1d2e3f4-0001-4000-8000-200000000001',
    'The clock with the wrong hands has always fascinated me. Do you know why they are arranged that way?',
    '2026-04-12 09:30:00',
    '2026-04-12 09:30:00'
  ),
  (
    'd1e2f3a4-0003-4000-8000-300000000003',
    'a1b2c3d4-0003-4000-8000-000000000003',
    'c1d2e3f4-0002-4000-8000-200000000002',
    'I can`t wait to experience Kopaonik in spring! Is it possible to find accommodation in May without a reservation?',
    '2026-04-16 15:00:00',
    '2026-04-16 15:00:00'
  ),
  (
    'd1e2f3a4-0004-4000-8000-300000000004',
    'a1b2c3d4-0006-4000-8000-000000000006',
    'c1d2e3f4-0003-4000-8000-200000000003',
    'Kovačević Winery has phenomenal Tamjanika! Great choice.',
    '2026-04-21 10:00:00',
    '2026-04-21 10:00:00'
  ),
  (
    'd1e2f3a4-0005-4000-8000-300000000005',
    'a1b2c3d4-0001-4000-8000-000000000001',
    'c1d2e3f4-0004-4000-8000-200000000004',
    'The sunset cruise is magical! The tour is worth every penny.',
    '2026-05-02 18:00:00',
    '2026-05-02 18:00:00'
  );

COMMIT;