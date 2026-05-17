// ── Constraints ──────────────────────────────────────────────────
CREATE CONSTRAINT user_id_unique IF NOT EXISTS
  FOR (u:User) REQUIRE u.id IS UNIQUE;

// ── Users ─────────────────────────────────────────────
MERGE (ana:User        {id: 'a1b2c3d4-0001-4000-8000-000000000001', username: 'ana'})
MERGE (marko:User      {id: 'a1b2c3d4-0002-4000-8000-000000000002', username: 'marko'})
MERGE (jovana:User     {id: 'a1b2c3d4-0003-4000-8000-000000000003', username: 'jovana'})
MERGE (stefan:User     {id: 'a1b2c3d4-0004-4000-8000-000000000004', username: 'stefan'})
MERGE (milica:User     {id: 'a1b2c3d4-0005-4000-8000-000000000005', username: 'milica'})
MERGE (nikola:User     {id: 'a1b2c3d4-0006-4000-8000-000000000006', username: 'nikola'})
MERGE (tijana:User     {id: 'a1b2c3d4-0007-4000-8000-000000000007', username: 'tijana'})
MERGE (aleksandar:User {id: 'a1b2c3d4-0008-4000-8000-000000000008', username: 'aleksandar'})
MERGE (katarina:User   {id: 'a1b2c3d4-0009-4000-8000-000000000009', username: 'katarina'})
MERGE (dragan:User     {id: 'a1b2c3d4-0010-4000-8000-000000000010', username: 'dragan'})

// ── Required follows ─────────────────────────────────────────────
MERGE (ana)-[:FOLLOWS]->(marko)
MERGE (ana)-[:FOLLOWS]->(dragan)
MERGE (milica)-[:FOLLOWS]->(marko)
MERGE (jovana)-[:FOLLOWS]->(stefan)
MERGE (nikola)-[:FOLLOWS]->(tijana)

// ── Extra follows ────────────────────────────────────────────────
MERGE (katarina)-[:FOLLOWS]->(ana)
MERGE (katarina)-[:FOLLOWS]->(tijana)
MERGE (aleksandar)-[:FOLLOWS]->(stefan)
MERGE (aleksandar)-[:FOLLOWS]->(dragan)
MERGE (nikola)-[:FOLLOWS]->(marko)
MERGE (nikola)-[:FOLLOWS]->(dragan)
MERGE (jovana)-[:FOLLOWS]->(ana)
MERGE (milica)-[:FOLLOWS]->(tijana)
MERGE (stefan)-[:FOLLOWS]->(dragan)
MERGE (marko)-[:FOLLOWS]->(tijana)
MERGE (dragan)-[:FOLLOWS]->(marko)
MERGE (tijana)-[:FOLLOWS]->(stefan)
MERGE (ana)-[:FOLLOWS]->(jovana)
MERGE (katarina)-[:FOLLOWS]->(nikola);