import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/tourApi';
import { useAuth } from '../context/AuthContext';
import { Btn, Difficulty, Tag, TransportPill, ErrBanner, Icon, ICONS, StatusBadge } from '../components';
import RecommendationsBanner from '../components/RecommendationsBanner';

export default function BrowseToursPage() {
  const { token } = useAuth();
  const [q, setQ] = useState('');
  const [diff, setDiff] = useState('All');
  const [layout, setLayout] = useState('grid');

  const { data: tours = [], isLoading, error } = useQuery({
    queryKey: ['published-tours'],
    queryFn: () => api.getPublishedTours(token),
  });

  const filtered = tours.filter((t) => {
    if (diff !== 'All' && t.difficulty !== diff) return false;
    if (q.trim()) {
      const s = q.toLowerCase();
      return t.name.toLowerCase().includes(s)
        || t.description.toLowerCase().includes(s)
        || t.tags.some((tg) => tg.toLowerCase().includes(s));
    }
    return true;
  });

  if (isLoading) return <div className="container" style={{ padding: 40 }}>Loading…</div>;
  if (error) return <div className="container" style={{ padding: 40 }}><ErrBanner>{error.message}</ErrBanner></div>;

  return (
    <div style={{
      background: `linear-gradient(to right, rgba(245,240,232,0) 0%, rgb(245,240,232) 18%, rgb(245,240,232) 82%, rgba(245,240,232,0) 100%), url('https://images.unsplash.com/photo-1476673160081-cf065607f449?w=3840&q=100&fm=webp') center/cover no-repeat fixed`,
    }}>
    <div className="container" style={{ padding: '40px 0 80px' }}>
      <div style={{ marginBottom: 26 }}>
        <span className="eyebrow">Wanderings</span>
        <h1 style={{ marginTop: 6 }}>Walks worth taking</h1>
        <p className="muted" style={{ marginTop: 6, maxWidth: 580 }}>
          Hand-picked tours from local guides. The first stop is on the map — the rest is yours to discover.
        </p>
      </div>

      <RecommendationsBanner />

      <div className="card p-16 fade-up" style={{
        display: 'grid', gridTemplateColumns: '1fr auto auto auto',
        gap: 12, alignItems: 'center', marginBottom: 22,
      }}>
        <div style={{ position: 'relative' }}>
          <Icon d={ICONS.search} size={16} style={{
            position: 'absolute', left: 14, top: '50%',
            transform: 'translateY(-50%)', color: 'var(--ink-faint)',
          }} />
          <input className="input" placeholder="Search by name, place or tag…" value={q}
            onChange={(e) => setQ(e.target.value)} style={{ paddingLeft: 38 }} />
        </div>
        <div className="row gap-4">
          {['All', 'Easy', 'Medium', 'Hard'].map((d) => (
            <button key={d} onClick={() => setDiff(d)}
              className={`btn ${diff === d ? 'btn-primary' : 'btn-ghost'} btn-sm`}>{d}</button>
          ))}
        </div>
        <div className="row gap-4">
          <button onClick={() => setLayout('grid')}
            className={`btn ${layout === 'grid' ? 'btn-primary' : 'btn-ghost'} btn-sm`}>
            <Icon d="M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z" size={14} />
          </button>
          <button onClick={() => setLayout('list')}
            className={`btn ${layout === 'list' ? 'btn-primary' : 'btn-ghost'} btn-sm`}>
            <Icon d="M3 6h18M3 12h18M3 18h18" size={14} />
          </button>
        </div>
        <span className="faint" style={{ fontSize: 13 }}>{filtered.length} tour{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <h3>No matches</h3>
          <p>Try a different keyword or clear the difficulty filter.</p>
        </div>
      ) : layout === 'list' ? (
        <div className="col gap-16">
          {filtered.map((t, i) => <PublishedRow key={t.id} tour={t} idx={i} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
          {filtered.map((t, i) => <PublishedCard key={t.id} tour={t} idx={i} />)}
        </div>
      )}
    </div>
    </div>
  );
}

function TourCover({ imageUrl, height = 170, label }) {
  if (imageUrl) {
    return (
      <div style={{ height, overflow: 'hidden', flexShrink: 0 }}>
        <img src={imageUrl} alt={label}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    );
  }
  return (
    <div style={{
      height, flexShrink: 0,
      background: 'linear-gradient(135deg, var(--sage-light) 0%, var(--paper-deep) 100%)',
      display: 'grid', placeItems: 'center',
    }}>
      <span style={{ fontFamily: 'var(--serif)', fontSize: 32, color: 'var(--sage-deep)', opacity: 0.4 }}>
        {label?.[0]?.toUpperCase() || '?'}
      </span>
    </div>
  );
}

function PublishedCard({ tour, idx }) {
  const navigate = useNavigate();
  const fk = tour.firstKeyPoint;
  return (
    <div className="card fade-up" style={{
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      animationDelay: `${idx * 50}ms`,
    }}>
      <TourCover imageUrl={fk?.imageUrl} height={170} label={tour.name} />
      <div className="col gap-8 p-20" style={{ flex: 1 }}>
        <div className="row gap-8 wrap" style={{ alignItems: 'center' }}>
          <Difficulty value={tour.difficulty} />
          <span className="faint" style={{ fontSize: 12 }}>
            · {tour.lengthInKm != null ? tour.lengthInKm.toFixed(1) : '—'} km
          </span>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 13, color: 'var(--sage-darker)', marginLeft: 'auto' }}>€{tour.price}</span>
        </div>
        <h3 style={{ marginTop: 2 }}>{tour.name}</h3>
        <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.55 }}>{tour.description}</p>
        <div className="row gap-6 wrap" style={{ marginTop: 2 }}>
          {tour.tags.slice(0, 4).map((t) => <Tag key={t}>{t}</Tag>)}
        </div>
        <hr className="hr-dashed" style={{ margin: '10px 0' }} />
        <div className="row gap-8 wrap">
          {tour.durations.map((d) => <TransportPill key={d.id} type={d.transportType} mins={d.durationInMinutes} />)}
        </div>
        {fk && (
          <div className="row" style={{
            marginTop: 8, padding: '10px 12px',
            background: 'var(--paper-deep)', borderRadius: 'var(--radius)', gap: 10,
          }}>
            <span style={{
              width: 26, height: 26, flexShrink: 0,
              borderRadius: '50% 50% 50% 0',
              background: 'var(--terracotta)', transform: 'rotate(-45deg)',
              display: 'grid', placeItems: 'center',
              color: 'var(--paper)', fontFamily: 'var(--serif)', fontSize: 12, fontWeight: 600,
            }}>
              <span style={{ transform: 'rotate(45deg)' }}>1</span>
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Starts at {fk.name}</div>
              <div className="faint" style={{ fontSize: 11.5 }}>
                {fk.latitude.toFixed(3)}°, {fk.longitude.toFixed(3)}°
              </div>
            </div>
          </div>
        )}
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <Btn variant="primary" size="sm" iconRight="arrow" onClick={() => navigate(`/browse/${tour.id}`)}>View</Btn>
        </div>
      </div>
    </div>
  );
}

function PublishedRow({ tour, idx }) {
  const navigate = useNavigate();
  const fk = tour.firstKeyPoint;
  return (
    <div className="card fade-up" style={{
      display: 'grid', gridTemplateColumns: '200px 1fr 200px',
      gap: 0, overflow: 'hidden', animationDelay: `${idx * 40}ms`,
    }}>
      <TourCover imageUrl={fk?.imageUrl} height="100%" label={tour.name} />
      <div className="col gap-8" style={{ minWidth: 0, padding: 18 }}>
        <div className="row gap-8 wrap">
          <Difficulty value={tour.difficulty} />
          <span className="faint" style={{ fontSize: 12 }}>
            · {tour.lengthInKm != null ? tour.lengthInKm.toFixed(1) : '—'} km
          </span>
        </div>
        <h3>{tour.name}</h3>
        <p className="muted" style={{ fontSize: 14, lineHeight: 1.55 }}>{tour.description}</p>
        <div className="row gap-6 wrap">{tour.tags.map((t) => <Tag key={t}>{t}</Tag>)}</div>
        <div className="row gap-8 wrap" style={{ marginTop: 6 }}>
          {tour.durations.map((d) => <TransportPill key={d.id} type={d.transportType} mins={d.durationInMinutes} />)}
        </div>
      </div>
      <div className="col gap-12" style={{ alignItems: 'stretch', justifyContent: 'space-between', padding: 18, borderLeft: '0.5px dashed var(--sage-line)' }}>
        <div style={{ background: 'var(--paper-deep)', borderRadius: 'var(--radius)', padding: 12 }}>
          <div className="eyebrow" style={{ fontSize: 10 }}>Starts at</div>
          <div style={{ fontFamily: 'var(--serif)', color: 'var(--sage-darker)', fontSize: 15, marginTop: 4 }}>
            {fk?.name || '—'}
          </div>
          <div className="faint" style={{ fontSize: 11, marginTop: 2 }}>
            {fk ? `${fk.latitude.toFixed(3)}°, ${fk.longitude.toFixed(3)}°` : ''}
          </div>
        </div>
        <span className="price-badge" style={{ textAlign: 'center', justifyContent: 'center', fontSize: 16 }}>
          €{tour.price}
        </span>
        <Btn variant="primary" iconRight="arrow" onClick={() => navigate(`/browse/${tour.id}`)}>View</Btn>
      </div>
    </div>
  );
}
