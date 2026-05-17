-- Passwords are <username>123

BEGIN;

--
-- Users
--

INSERT INTO public.users (id, username, password, email, role, is_blocked) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'ana',        '$2b$10$cl227iU3iOhOeitP/J7.qee352iwPYLKWJFnMdZR/Xkt2xhyVR3ey', 'ana@gmail.com',        'tourist', false),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'marko',      '$2b$10$Sk6BOjfZsI7tefNfaU/P1OKEF5qkQJXu1LCyJ.KX5tyPW7Ibba8CS', 'marko@gmail.com',      'guide',   false),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'jovana',     '$2b$10$pcAQhjJnXSLDg3DSrNBKbu/Pz2OZwR9Nt4BmnRdxWu8awcqBo.EKe', 'jovana@gmail.com',     'tourist', false),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'stefan',     '$2b$10$ts3GjNUHgiZdhsfOlJMBmOiygOcVTZlT6eWF7IyH3c5xjzfnn.sBW', 'stefan@gmail.com',     'guide',   false),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'milica',     '$2b$10$9rilGxJ2cZ8AgDbBVdJ8POoGn5BZ3/48tdJ7hSoRyqGCehZ5uNPbe', 'milica@gmail.com',     'tourist', false),
  ('a1b2c3d4-0006-4000-8000-000000000006', 'nikola',     '$2b$10$pIdBiFVtK8cT8Yqc/2WUk..2YOO2iU1IZTXxzjghJ912ntAu2CWKy', 'nikola@gmail.com',     'tourist', false),
  ('a1b2c3d4-0007-4000-8000-000000000007', 'tijana',     '$2b$10$jsjrZ8m7qxcgQabLeX6jnO6UXVvGc1c1vkmFTmOjGIzcFvtzldK3C', 'tijana@gmail.com',     'guide',   false),
  ('a1b2c3d4-0008-4000-8000-000000000008', 'aleksandar', '$2b$10$2S134ZMYt6TSzxHdHUump.7x.HnQHrzCgg/OyDOlYWLGd.pe4zACG', 'alex@gmail.com',       'tourist', false),
  ('a1b2c3d4-0009-4000-8000-000000000009', 'katarina',   '$2b$10$oIsFFgjzlT.ZeyQex0VgTuKlOpK6LT.f19Qi6/GtuXUW.rxanxPu.', 'katarina@gmail.com',   'tourist', false),
  ('a1b2c3d4-0010-4000-8000-000000000010', 'dragan',     '$2b$10$bI.1Y/WqgbAOE3qjqmW2F.kLfhmU9q.GhONQn1.lefy.tRjMGlYwu', 'dragan@gmail.com',     'guide',   false),
  ('a1b2c3d4-0011-4000-8000-000000000011', 'admin',      '$2b$10$pU4Vzx0Za8jOV/257srz6OS61psB83nCWLzlrfnFyCU7u6tbMgUam', 'admin@gmail.com',      'admin',   false);

--
-- Profiles
--

INSERT INTO public.profiles (id, user_id, name, last_name, avatar, biography, motto, current_latitude, current_longitude) VALUES
  (
    'b1c2d3e4-0001-4000-8000-100000000001',
    'a1b2c3d4-0001-4000-8000-000000000001',
    'Ana', 'Jovanovic',
    'https://i.pravatar.cc/150?img=30',
    'Travel enthusiast who loves discovering hidden gems.',
    'Not all who wander are lost.',
    44.8176, 20.4569
  ),
  (
    'b1c2d3e4-0002-4000-8000-100000000002',
    'a1b2c3d4-0002-4000-8000-000000000002',
    'Marko', 'Petrovic',
    'https://i.pravatar.cc/150?img=68',
    'Licensed city guide with 8 years of experience in Novi Sad.',
    'Every city has a story worth telling.',
    45.2671, 19.8335
  ),
  (
    'b1c2d3e4-0003-4000-8000-100000000003',
    'a1b2c3d4-0003-4000-8000-000000000003',
    'Jovana', 'Nikolic',
    'https://i.pravatar.cc/150?img=28',
    'Backpacker at heart. Coffee addict. Amateur photographer.',
    'Collect moments, not things.',
    43.3209, 21.8958
  ),
  (
    'b1c2d3e4-0004-4000-8000-100000000004',
    'a1b2c3d4-0004-4000-8000-000000000004',
    'Stefan', 'Markovic',
    'https://i.pravatar.cc/150?img=12',
    'Mountain and nature guide. Specialized in Tara and Kopaonik tours.',
    'The mountains are calling and I must go.',
    43.2897, 20.8011
  ),
  (
    'b1c2d3e4-0005-4000-8000-100000000005',
    'a1b2c3d4-0005-4000-8000-000000000005',
    'Milica', 'Stankovic',
    'https://i.pravatar.cc/150?img=48',
    'Art lover and museum hopper. History nerd.',
    'The world is a book, and those who do not travel read only one page.',
    44.0165, 20.9114
  ),
  (
    'b1c2d3e4-0006-4000-8000-100000000006',
    'a1b2c3d4-0006-4000-8000-000000000006',
    'Nikola', 'Djordjevic',
    'https://i.pravatar.cc/150?img=67',
    'Software developer by day, explorer by night.',
    'Debug the world one city at a time.',
    44.8176, 20.4569
  ),
  (
    'b1c2d3e4-0007-4000-8000-100000000007',
    'a1b2c3d4-0007-4000-8000-000000000007',
    'Tijana', 'Lukic',
    'https://i.pravatar.cc/150?img=32',
    'Food and wine tour specialist. Certified sommelier.',
    'Wine a little, travel a lot.',
    45.2671, 19.8335
  ),
  (
    'b1c2d3e4-0008-4000-8000-100000000008',
    'a1b2c3d4-0008-4000-8000-000000000008',
    'Aleksandar', 'Ilic',
    'https://i.pravatar.cc/150?img=8',
    'Ex-military now passionate about historical battlefield tours.',
    'Know your history or repeat it.',
    44.2388, 19.8935
  ),
  (
    'b1c2d3e4-0009-4000-8000-100000000009',
    'a1b2c3d4-0009-4000-8000-000000000009',
    'Katarina', 'Vukovic',
    'https://i.pravatar.cc/150?img=24',
    'First-time traveler. Excited to explore the Balkans!',
    'Adventure awaits.',
    NULL, NULL
  ),
  (
    'b1c2d3e4-0010-4000-8000-100000000010',
    'a1b2c3d4-0010-4000-8000-000000000010',
    'Dragan', 'Savic',
    'https://i.pravatar.cc/150?img=54',
    'River and Danube cruise guide. Born and raised in Zemun.',
    'Life is better on the water.',
    44.8458, 20.4122
  ),
  (
    'b1c2d3e4-0011-4000-8000-100000000011',
    'a1b2c3d4-0011-4000-8000-000000000011',
    NULL, NULL,
    NULL,
    NULL,
    NULL,
    NULL, NULL
  );

COMMIT;