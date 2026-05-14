import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import { api } from '../api/tourApi';
import { useAuth } from '../context/AuthContext';
import { Btn, Difficulty, Tag, TransportPill, ErrBanner, Icon, ICONS } from '../components';

import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

function makeKpIcon(index, isFirst) {
  return L.divIcon({
    html: `<div class="kp-marker ${isFirst ? 'kp-marker-first' : ''}"><span>${index + 1}</span></div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}

function RouteLayer({ keyPoints }) {
  const map = useMap();

  useEffect(() => {
    if (keyPoints.length < 2) return;

    const waypoints = keyPoints.map((kp) =>
      L.latLng(kp.latitude, kp.longitude)
    );

    const control = L.Routing.control({
      waypoints,
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: false,
      show: false,
      lineOptions: { styles: [{ color: '#5a7a5a', weight: 3, opacity: 0.7 }], },
      createMarker: () => null,
    });

    const orig = control._clearLines.bind(control);
    control._clearLines = function () {
      if (this._map) orig();
    };

    control.addTo(map);

    return () => {
      try { control.getPlan().setWaypoints([]); } catch (_) {}
      try { map.removeControl(control); } catch (_) {}
    };

    return () => { map.removeControl(control) };
  }, [keyPoints.map((k) => `${k.id}-${k.latitude}-${k.longitude}`).join(',')]);

  return null;
}

export default function PublicTourDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [statusMessage, setStatusMessage] = useState(null);

  const { data: tour, isLoading, error } = useQuery({
    queryKey: ['public-tour', id],
    queryFn: () => api.getPublicTour(id, token),
    enabled: Boolean(id && token),
    refetchOnMount: 'always',
  });

  const addToCartMut = useMutation({
    mutationFn: () => api.addToCart({
      tour_id: tour.id,
      tour_name: tour.name,
      tour_description: tour.description,
      price: tour.price,
    }, token),
    onSuccess: () => {
      setStatusMessage('Added to cart successfully.');
      qc.invalidateQueries({ queryKey: ['public-tour', id] });
    },
    onError: (e) => {
      setStatusMessage(e.message);
    },
  });

  if (isLoading) return <div className="container" style={{ padding: 40 }}>Loading…</div>;
  if (error) return <div className="container" style={{ padding: 40 }}><ErrBanner>{error.message}</ErrBanner></div>;
  if (!tour) return <div className="container" style={{ padding: 40 }}>Tour not found.</div>;

  const mapPoints = tour.keyPoints && tour.keyPoints.length > 0
    ? tour.keyPoints
    : tour.firstKeyPoint ? [tour.firstKeyPoint] : [];

  const center = mapPoints.length > 0
    ? [mapPoints[0].latitude, mapPoints[0].longitude]
    : [46.37, 14.10];
  const zoom = mapPoints.length > 0 ? 13 : 4;

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
        <div className="row gap-12" style={{ marginTop: 18, alignItems: 'center' }}>
          {tour.isPurchased ? (
            <span className="badge badge-success">Purchased</span>
          ) : (
            <Btn variant="primary" onClick={() => addToCartMut.mutate()} disabled={addToCartMut.isLoading}>
              {addToCartMut.isLoading ? 'Adding…' : 'Add to cart'}
            </Btn>
          )}
          {statusMessage && <span className="faint" style={{ fontSize: 13 }}>{statusMessage}</span>}
        </div>
      </div>

      {/* Map + key point list */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        <div className="card fade-up" style={{ padding: 16 }}>
          <span className="eyebrow">The route</span>
          <h3 style={{ marginTop: 4, marginBottom: 12 }}>Map &amp; key points</h3>
          <div style={{ height: 460, borderRadius: 12, overflow: 'hidden', border: '0.5px solid #c8d5c0' }}>
            <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                subdomains="abcd"
                attribution="© OpenStreetMap · © CARTO"
                maxZoom={19}
              />
              {mapPoints.map((kp, i) => (
                <Marker key={kp.id || i} position={[kp.latitude, kp.longitude]} icon={makeKpIcon(i, i === 0)}>
                  <Popup>
                    <div style={{ minWidth: 180 }}>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--sage-darker)', marginBottom: 4 }}>{kp.name}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.4 }}>{kp.description}</div>
                      {kp.imageUrl && (
                        <img src={kp.imageUrl} alt={kp.name}
                          style={{ width: '100%', borderRadius: 6, marginTop: 8, objectFit: 'cover', maxHeight: 120 }} />
                      )}
                    </div>
                  </Popup>
                  <Tooltip direction="top" offset={[0, -24]} opacity={0.95}>{kp.name}</Tooltip>
                </Marker>
              ))}
              {tour?.keyPoints?.length > 1 && <RouteLayer keyPoints={tour?.keyPoints} />}
            </MapContainer>
          </div>
        </div>

        {/* Key points list */}
        <div className="card fade-up p-20">
          <span className="eyebrow">Route details</span>
          <h3 style={{ marginTop: 4, marginBottom: 12 }}>{tour.isPurchased ? 'All key points' : 'First stop'}</h3>
          {mapPoints.length === 0 ? (
            <div className="empty" style={{ padding: 22 }}>
              <p style={{ margin: 0 }}>No stops listed yet.</p>
            </div>
          ) : tour.isPurchased ? (
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mapPoints.map((kp, index) => (
                <li key={kp.id || index} style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: 12, padding: '10px 0', borderTop: index === 0 ? 'none' : '0.5px dashed var(--sage-line)' }}>
                  <span style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: index === 0 ? 'var(--sage-deep)' : 'var(--terracotta)', color: 'var(--paper)',
                    display: 'grid', placeItems: 'center',
                    fontFamily: 'var(--serif)', fontSize: 13, fontWeight: 600,
                  }}>{index + 1}</span>
                  <div>
                    <h4 style={{ fontSize: 15, margin: 0 }}>{kp.name}</h4>
                    <p className="muted" style={{ fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>{kp.description}</p>
                    {kp.imageUrl && (
                      <img src={kp.imageUrl} alt={kp.name}
                        style={{ width: '100%', borderRadius: 8, marginTop: 8, objectFit: 'cover', maxHeight: 140 }} />
                    )}
                    <p className="faint" style={{ fontSize: 12, marginTop: 10 }}>
                      {kp.latitude.toFixed(3)}, {kp.longitude.toFixed(3)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: 12, padding: '10px 0' }}>
              <span style={{
                width: 26, height: 26, borderRadius: '50%',
                background: 'var(--sage-deep)', color: 'var(--paper)',
                display: 'grid', placeItems: 'center',
                fontFamily: 'var(--serif)', fontSize: 13, fontWeight: 600,
              }}>1</span>
              <div>
                <h4 style={{ fontSize: 15 }}>{mapPoints[0].name}</h4>
                <p className="muted" style={{ fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>{mapPoints[0].description}</p>
                {mapPoints[0].imageUrl && (
                  <img src={mapPoints[0].imageUrl} alt={mapPoints[0].name}
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
