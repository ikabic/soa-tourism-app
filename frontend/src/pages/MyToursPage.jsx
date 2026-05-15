import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/tourApi';
import { useAuth } from '../context/AuthContext';
import { Btn, StatusBadge, Difficulty, Tag, TransportPill, ErrBanner, Icon, ICONS } from '../components';
import { formatDate } from '../utils/helpers';
import RecommendationsBanner from '../components/RecommendationsBanner';

export default function MyToursPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [filter, setFilter] = useState('All');

  const { data: tours = [], isLoading, error } = useQuery({
    queryKey: ['my-tours'],
    queryFn: () => api.getMyTours(token),
  });

  const filtered = filter === 'All' ? tours : tours.filter((t) => t.status === filter);
  const counts = {
    All: tours.length,
    Draft: tours.filter((t) => t.status === 'Draft').length,
    Published: tours.filter((t) => t.status === 'Published').length,
    Archived: tours.filter((t) => t.status === 'Archived').length,
  };

  if (isLoading) return <div className="container" style={{ padding: 40 }}>Loading…</div>;
  if (error) return <div className="container" style={{ padding: 40 }}><ErrBanner>{error.message}</ErrBanner></div>;

  return (
    <div className="container" style={{ padding: '40px 0 80px' }}>
      <div className="row between" style={{ alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <span className="eyebrow">Field journal</span>
          <h1 style={{ marginTop: 6 }}>My tours</h1>
          <p className="muted" style={{ marginTop: 6, maxWidth: 520 }}>
            Drafts, published walks and archived routes you've authored.
            Only published tours are visible to travellers.
          </p>
        </div>
        <Btn variant="primary" icon="plus" size="lg" onClick={() => navigate('/tours/create')}>
          New tour
        </Btn>
      </div>

      <RecommendationsBanner />

      <div className="row gap-8 wrap" style={{ marginBottom: 22 }}>
        {Object.keys(counts).map((k) => (
          <button key={k}
            onClick={() => setFilter(k)}
            className={`btn ${filter === k ? 'btn-primary' : 'btn-ghost'} btn-sm`}>
            {k}
            <span style={{
              padding: '1px 7px', borderRadius: 999, fontSize: 11, fontWeight: 700,
              background: filter === k ? 'rgba(255,255,255,.18)' : 'var(--paper-deep)',
              color: filter === k ? 'currentColor' : 'var(--ink-faint)',
              marginLeft: 4,
            }}>{counts[k]}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <h3>No tours yet</h3>
          <p>Sketch your first walk — you can add key points and durations later.</p>
          <div style={{ marginTop: 14 }}>
            <Btn variant="primary" icon="plus" onClick={() => navigate('/tours/create')}>Create a tour</Btn>
          </div>
        </div>
      ) : (
        <div className="col gap-16">
          {filtered.map((t, i) => (
            <TourRow key={t.id} tour={t} idx={i} onMutated={() => qc.invalidateQueries({ queryKey: ['my-tours'] })} />
          ))}
        </div>
      )}
    </div>
  );
}

function TourRow({ tour, idx, onMutated }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [err, setErr] = useState(null);

  const publishMut = useMutation({
    mutationFn: () => api.publishTour(tour.id, token),
    onSuccess: onMutated,
    onError: (e) => setErr(e.message),
  });
  const archiveMut = useMutation({
    mutationFn: () => api.archiveTour(tour.id, token),
    onSuccess: onMutated,
    onError: (e) => setErr(e.message),
  });
  const activateMut = useMutation({
    mutationFn: () => api.activateTour(tour.id, token),
    onSuccess: onMutated,
    onError: (e) => setErr(e.message),
  });

  const tryPublish = () => {
    if (tour.keyPoints.length < 2) {
      setErr('Tour must have at least 2 key points before it can be published.');
      return;
    }
    if (tour.durations.length < 1) {
      setErr('Add at least one duration estimate before publishing.');
      return;
    }
    publishMut.mutate();
  };

  const coverUrl = (tour.keyPoints || []).find((k) => k.order === 1)?.imageUrl
    ?? (tour.keyPoints || [])[0]?.imageUrl;

  return (
    <div className="card fade-up" style={{
      display: 'grid', gridTemplateColumns: '160px 1fr auto',
      gap: 0, overflow: 'hidden',
      animationDelay: `${idx * 40}ms`,
    }}>
      {coverUrl ? (
        <img src={coverUrl} alt={tour.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <div style={{
          background: 'linear-gradient(135deg, var(--sage-light) 0%, var(--paper-deep) 100%)',
          display: 'grid', placeItems: 'center',
        }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 28, color: 'var(--sage-deep)', opacity: 0.4 }}>
            {tour.name?.[0]?.toUpperCase() || '?'}
          </span>
        </div>
      )}
      <div className="col gap-8" style={{ minWidth: 0, padding: 20 }}>
        <div className="row gap-12 wrap" style={{ alignItems: 'center' }}>
          <StatusBadge status={tour.status} />
          <Difficulty value={tour.difficulty} />
          <span className="faint" style={{ fontSize: 13 }}>· created {formatDate(tour.createdAt)}</span>
        </div>
        <h3 style={{ marginTop: 2 }}>{tour.name}</h3>
        <p className="muted" style={{ fontSize: 14, lineHeight: 1.55, maxWidth: 620 }}>{tour.description}</p>
        <div className="row gap-6 wrap" style={{ marginTop: 4 }}>
          {tour.tags.map((tg) => <Tag key={tg}>{tg}</Tag>)}
        </div>
        <div className="row gap-24" style={{ marginTop: 10 }}>
          <div className="stat">
            <span className="v">
              {tour.lengthInKm != null ? tour.lengthInKm.toFixed(1) : '—'}
              <span style={{ fontSize: 14, color: 'var(--ink-faint)' }}> km</span>
            </span>
            <span className="l">Distance</span>
          </div>
          <div className="stat">
            <span className="v">{tour.keyPoints.length}</span>
            <span className="l">Key points</span>
          </div>
          <div className="stat">
            <span className="v">{tour.durations.length}</span>
            <span className="l">Durations</span>
          </div>
          <div className="stat">
            <span className="v">€{tour.price}</span>
            <span className="l">Price</span>
          </div>
        </div>
        {err && (
          <div style={{ marginTop: 10 }}>
            <ErrBanner onClose={() => setErr(null)}>{err}</ErrBanner>
          </div>
        )}
      </div>

      <div className="col gap-8" style={{ alignItems: 'stretch', minWidth: 160, padding: 20, borderLeft: '0.5px dashed var(--sage-line)' }}>
        <Btn variant="ghost" size="sm" icon="map" onClick={() => navigate(`/tours/${tour.id}`)}>Open</Btn>
        {tour.status === 'Draft' && (
          <Btn variant="primary" size="sm" icon="upload"
            disabled={publishMut.isPending} onClick={tryPublish}>
            Publish
          </Btn>
        )}
        {tour.status === 'Published' && (
          <Btn variant="secondary" size="sm" icon="archive"
            disabled={archiveMut.isPending}
            onClick={() => archiveMut.mutate()}>
            Archive
          </Btn>
        )}
        {tour.status === 'Archived' && (
          <Btn variant="primary" size="sm" icon="refresh"
            disabled={activateMut.isPending}
            onClick={() => activateMut.mutate()}>
            Reactivate
          </Btn>
        )}
        <span className="faint" style={{ fontSize: 11, textAlign: 'center', marginTop: 4 }}>
          {tour.status === 'Published' ? `Live since ${formatDate(tour.publishedAt)}`
            : tour.status === 'Archived' ? `Archived ${formatDate(tour.archivedAt)}`
            : 'Not visible to travellers'}
        </span>
      </div>
    </div>
  );
}
