// MongoDB initialization script for blog service
// Inserts blog_posts, comments, and blog_likes documents with UUID values.

const dbName = process.env.MONGO_INITDB_DATABASE || 'blog';
const blogDb = db.getSiblingDB(dbName);

blogDb.blog_posts.insertMany([
  {
    _id: 'c1d2e3f4-0001-4000-8000-200000000001',
    author_id: 'a1b2c3d4-0002-4000-8000-000000000002',
    created_at: new Date('2026-04-10T10:00:00Z'),
    description: `## Novi Sad Up Close

Last week I guided a group through the Petrovaradin Fortress, and every time I am amazed again by the view of the Danube from the upper walls.

The tour starts at Liberty Square, passes through Zmaj Jovina Street, and ends at the fortress where tourists can see the clock with the "wrong" hands.

Tips for visitors:
- Arrive early in the morning to avoid crowds
- Wear comfortable shoes
- Make sure to visit the underground tunnels`,
    image_urls: 'https://picsum.photos/seed/petrovaradin/800/400',
    likes_count: 12,
    title: 'Secrets of the Petrovaradin Fortress'
  },
  {
    _id: 'c1d2e3f4-0002-4000-8000-200000000002',
    author_id: 'a1b2c3d4-0004-4000-8000-000000000004',
    created_at: new Date('2026-04-15T14:30:00Z'),
    description: `## Kopaonik Off-Season

Many people think Kopaonik is only a winter destination, but spring in Kopaonik is something special.

Mountain flora blooms from May, the trails are peaceful, and accommodation prices are twice as low as in winter.

Recommended trails:
1. Suvo Rudište - Pančić Peak (easy, 2h)
2. Brzeće - Karaman Ridge (medium, 4h)
3. Kula - Srebrnac (hard, 6h)

Always check weather conditions before departure.`,
    image_urls: 'https://picsum.photos/seed/kopaonik-spring/800/400',
    likes_count: 8,
    title: 'Kopaonik in Spring - Forgotten Beauty'
  },
  {
    _id: 'c1d2e3f4-0003-4000-8000-200000000003',
    author_id: 'a1b2c3d4-0007-4000-8000-000000000007',
    created_at: new Date('2026-04-20T09:15:00Z'),
    description: `## Wine Tour Through Fruška Gora

Fruška Gora hides 16 monasteries and dozens of vineyards producing some of the best Serbian wines.

On my last tour we visited:
- Krušedol Monastery - founded in 1509
- Kovačević Winery - excellent Chardonnay and Tamjanika
- Novo Hopovo Monastery - 17th century frescoes

Recommendation: Kutjevo Graševina with local cheese is a combination you must try!`,
    image_urls: 'https://picsum.photos/seed/fruska-gora-wine/800/400',
    likes_count: 15,
    title: 'Fruška Gora - Monasteries and Wine'
  },
  {
    _id: 'c1d2e3f4-0004-4000-8000-200000000004',
    author_id: 'a1b2c3d4-0010-4000-8000-000000000010',
    created_at: new Date('2026-05-01T11:00:00Z'),
    description: `## Danube Cruise Through Zemun

Zemun is one of the rare parts of Belgrade that has preserved its Austro-Hungarian charm. From the Gardoš Tower, the view stretches all the way to the confluence of the Sava and Danube rivers.

My cruise includes:
- Departure below the Liberation Quay
- Passing by War Island (June-September)
- Stop at Great War Island
- Return during sunset

Duration: 2.5 hours | Price: €25 per person`,
    image_urls: 'https://picsum.photos/seed/zemun-danube/800/400',
    likes_count: 20,
    title: 'The Danube from Another Perspective - Cruise Through Zemun'
  },
  {
    _id: 'c1d2e3f4-0005-4000-8000-200000000005',
    author_id: 'a1b2c3d4-0002-4000-8000-000000000002',
    created_at: new Date('2026-05-05T16:00:00Z'),
    description: `## What to Bring on a Tour?

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

Good luck and enjoy exploring!`,
    image_urls: 'https://picsum.photos/seed/tour-checklist/800/400',
    likes_count: 6,
    title: 'Preparation Guide - What to Bring on a Tour'
  }
]);

blogDb.comments.insertMany([
  {
    _id: 'd1e2f3a4-0001-4000-8000-300000000001',
    author_id: 'a1b2c3d4-0001-4000-8000-000000000001',
    blog_post_id: 'c1d2e3f4-0001-4000-8000-200000000001',
    content: 'I went on this tour last month and the tunnels are truly amazing! I recommend it to everyone.',
    created_at: new Date('2026-04-11T12:00:00Z'),
    updated_at: new Date('2026-04-11T12:00:00Z')
  },
  {
    _id: 'd1e2f3a4-0002-4000-8000-300000000002',
    author_id: 'a1b2c3d4-0005-4000-8000-000000000005',
    blog_post_id: 'c1d2e3f4-0001-4000-8000-200000000001',
    content: 'The clock with the wrong hands has always fascinated me. Do you know why they are arranged that way?',
    created_at: new Date('2026-04-12T09:30:00Z'),
    updated_at: new Date('2026-04-12T09:30:00Z')
  },
  {
    _id: 'd1e2f3a4-0003-4000-8000-300000000003',
    author_id: 'a1b2c3d4-0003-4000-8000-000000000003',
    blog_post_id: 'c1d2e3f4-0002-4000-8000-200000000002',
    content: 'I can`t wait to experience Kopaonik in spring! Is it possible to find accommodation in May without a reservation?',
    created_at: new Date('2026-04-16T15:00:00Z'),
    updated_at: new Date('2026-04-16T15:00:00Z')
  },
  {
    _id: 'd1e2f3a4-0004-4000-8000-300000000004',
    author_id: 'a1b2c3d4-0006-4000-8000-000000000006',
    blog_post_id: 'c1d2e3f4-0003-4000-8000-200000000003',
    content: 'Kovačević Winery has phenomenal Tamjanika! Great choice.',
    created_at: new Date('2026-04-21T10:00:00Z'),
    updated_at: new Date('2026-04-21T10:00:00Z')
  },
  {
    _id: 'd1e2f3a4-0005-4000-8000-300000000005',
    author_id: 'a1b2c3d4-0001-4000-8000-000000000001',
    blog_post_id: 'c1d2e3f4-0004-4000-8000-200000000004',
    content: 'The sunset cruise is magical! The tour is worth every penny.',
    created_at: new Date('2026-05-02T18:00:00Z'),
    updated_at: new Date('2026-05-02T18:00:00Z')
  }
]);

// The unique compound index on blog_post_id and user_id is created by Spring Data MongoDB
