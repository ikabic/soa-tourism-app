import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../api/tourApi';
import { useAuth } from '../context/AuthContext';
import { Difficulty, Tag, TransportPill, ErrBanner, Icon, ICONS } from '../components';

function makeKpIcon(index, isFirst) {
  return L.divIcon({
    html: `<div class="kp-marker ${isFirst ? 'kp-marker-first' : ''}"><span>${index + 1}</span></div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}


export default function PublicTourDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const { data: tours = [], isLoading, error } = useQuery({
    queryKey: ['published-tours'],
    queryFn: () => api.getPublishedTours(token),
  });

  const tour = tours.find((t) => t.id === id);

  if (isLoading) return <div className="container" style={{ padding: 40 }}>Loading…</div>;
  if (error) return <div className="container" style={{ padding: 40 }}><ErrBanner>{error.message}</ErrBanner></div>;
  if (!tour) return <div className="container" style={{ padding: 40 }}>Tour not found.</div>;

  const firstKeyPoint = tour.firstKeyPoint;
  const center = firstKeyPoint ? [firstKeyPoint.latitude, firstKeyPoint.longitude] : [46.37, 14.10];

  return (
    <div className="container" style={{ padding: '32px 0 80px' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/browse')} style={{ marginBottom: 16 }}>
        <Icon d={ICONS.chevL} size={14} /> Back to tours
      </button>

      {/* Header */}
      <div className="card p-24 fade-up" style={{ marginBottom: 20 }}>
        <div className="row gap-12 wrap" style={{ marginBottom: 8 }}>
          <Difficulty value={tour.difficulty} />
        </div>
        <h1 style={{ marginTop: 4, fontSize: 36 }}>{tour.name}</h1>
        <p className="muted" style={{ maxWidth: 700, fontSize: 15, marginTop: 8 }}>{tour.description}</p>
        <div className="row gap-6 wrap" style={{ marginTop: 10 }}>
          {tour.tags.map((t) => <Tag key={t}>{t}</Tag>)}
        </div>
        <div className="row gap-24" style={{ marginTop: 18 }}>
          <div className="stat">
            <span className="v">
              {tour.lengthInKm != null ? tour.lengthInKm.toFixed(1) : '—'}
              <span style={{ fontSize: 13, color: 'var(--ink-faint)' }}> km</span>
            </span>
            <span className="l">Distance</span>
          </div>
          <div className="stat">
            <span className="v" style={{ fontFamily: 'var(--serif)' }}>€{tour.price}</span>
            <span className="l">Price</span>
          </div>
        </div>
        <div className="row gap-8 wrap" style={{ marginTop: 14 }}>
          {tour.durations.map((d) => (
            <TransportPill key={d.id} type={d.transportType} mins={d.durationInMinutes} />
          ))}
        </div>
      </div>

      {/* Map + key point list */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        <div className="card fade-up" style={{ padding: 16 }}>
          <span className="eyebrow">The route</span>
          <h3 style={{ marginTop: 4, marginBottom: 12 }}>Map &amp; key points</h3>
          <div style={{ height: 460, borderRadius: 12, overflow: 'hidden', border: '0.5px solid #c8d5c0' }}>
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                subdomains="abcd"
                attribution="© OpenStreetMap · © CARTO"
                maxZoom={19}
              />
              {firstKeyPoint && (
                <Marker position={[firstKeyPoint.latitude, firstKeyPoint.longitude]} icon={makeKpIcon(0, true)}>
                  <Popup>
                    <div style={{ minWidth: 180 }}>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--sage-darker)', marginBottom: 4 }}>{firstKeyPoint.name}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.4 }}>{firstKeyPoint.description}</div>
                      {firstKeyPoint.imageUrl && (
                        <img src={firstKeyPoint.imageUrl} alt={firstKeyPoint.name}
                          style={{ width: '100%', borderRadius: 6, marginTop: 8, objectFit: 'cover', maxHeight: 120 }} />
                      )}
                    </div>
                  </Popup>
                  <Tooltip direction="top" offset={[0, -24]} opacity={0.95}>{firstKeyPoint.name}</Tooltip>
                </Marker>
              )}
            </MapContainer>
          </div>
        </div>

        {/* Key points list */}
        <div className="card fade-up p-20">
          <span className="eyebrow">Starting point</span>
          <h3 style={{ marginTop: 4, marginBottom: 12 }}>First stop</h3>
          {!firstKeyPoint ? (
            <div className="empty" style={{ padding: 22 }}>
              <p style={{ margin: 0 }}>No stops listed yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: 12, padding: '10px 0' }}>
              <span style={{
                width: 26, height: 26, borderRadius: '50%',
                background: 'var(--sage-deep)', color: 'var(--paper)',
                display: 'grid', placeItems: 'center',
                fontFamily: 'var(--serif)', fontSize: 13, fontWeight: 600,
              }}>1</span>
              <div>
                <h4 style={{ fontSize: 15 }}>{firstKeyPoint.name}</h4>
                <p className="muted" style={{ fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>{firstKeyPoint.description}</p>
                {firstKeyPoint.imageUrl && (
                  <img src={firstKeyPoint.imageUrl} alt={firstKeyPoint.name}
                    style={{ width: '100%', borderRadius: 8, marginTop: 8, objectFit: 'cover', maxHeight: 140 }} />
                )}
                <p className="faint" style={{ fontSize: 12, marginTop: 10, fontStyle: 'italic' }}>
                  Further stops are revealed after purchase.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
