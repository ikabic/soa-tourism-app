import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/tourApi';
import { useAuth } from '../context/AuthContext';
import { Btn, ErrBanner } from '../components';

export default function PurchasedToursPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const { data: purchases, isLoading, error } = useQuery({
    queryKey: ['purchases'],
    queryFn: () => api.getPurchases(token),
    enabled: Boolean(token),
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  if (isLoading) return <div className="container" style={{ padding: 40 }}>Loading…</div>;
  if (error) return <div className="container" style={{ padding: 40 }}><ErrBanner>{error.message}</ErrBanner></div>;

  return (
    <div className="container" style={{ padding: '32px 0 80px' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/browse')} style={{ marginBottom: 16 }}>
        Back to browsing
      </button>

      <div className="card p-24 fade-up" style={{ marginBottom: 20 }}>
        <span className="eyebrow">Purchased tours</span>
        <h1 style={{ marginTop: 4 }}>Your purchases</h1>
        <p className="muted" style={{ marginTop: 8, maxWidth: 680 }}>
          These are the tours you've already bought. Open any tour for full route details and access.
        </p>
      </div>

      {purchases?.length === 0 ? (
        <div className="empty" style={{ padding: 22 }}>
          <h3>You haven't purchased any tours yet.</h3>
          <p>Browse available tours and checkout to unlock them.</p>
        </div>
      ) : (
        <div className="col gap-16">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="card fade-up p-20" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16 }}>
              <div>
                <h3 style={{ margin: 0 }}>{purchase.tour_name}</h3>
                <p className="muted" style={{ marginTop: 6 }}>{purchase.tour_description || 'No description available.'}</p>
                <p className="muted" style={{ marginTop: 6 }}>€{purchase.price.toFixed(2)}</p>
              </div>
              <div className="col gap-8" style={{ alignItems: 'flex-end' }}>
                <Btn variant="primary" size="sm" onClick={() => navigate(`/browse/${purchase.tour_id}`)}>
                  View tour
                </Btn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
