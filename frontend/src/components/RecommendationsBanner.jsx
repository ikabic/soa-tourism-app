import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api as followersApi } from '../api/followersApi';
import { api as stakeholdersApi } from '../api/stakeholdersApi';
import { Btn, Icon, ICONS, ProfileUsername } from '.';
import { useNavigate } from 'react-router-dom';

export default function RecommendationsBanner() {
  const { token, user } = useAuth();
  const qc = useQueryClient();
  const [dismissed, setDismissed] = useState(false);

  const { data: recIds = [] } = useQuery({
    queryKey: ['recommendations', user?.userId],
    queryFn: async () => {
      const result = await followersApi.getRecommendations(user?.userId, token);
      return result ?? [];
    },
    enabled: Boolean(token && user?.userId),
    staleTime: 60_000,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['rec-profiles', recIds],
    queryFn: () => stakeholdersApi.getProfiles(recIds.join(',')),
    enabled: recIds.length > 0,
    staleTime: 60_000,
  });

  const followMut = useMutation({
    mutationFn: (id) => followersApi.follow(id, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  if (dismissed || recIds.length === 0 || profiles.length === 0) return null;

  return (
    <div className="card fade-up" style={{
      marginBottom: 22,
      padding: '16px 20px',
      background: 'linear-gradient(to right, var(--sage-soft), var(--paper))',
      border: '0.5px solid var(--sage-line)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <span className="eyebrow">Suggested for you</span>
          <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>
            People followed by those you follow
          </p>
        </div>
        <button className="btn-icon" onClick={() => setDismissed(true)} title="Dismiss">
          <Icon d={ICONS.close} size={14} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {profiles.slice(0, 5).map((profile) => (
          <RecommendationCard
            key={profile.id}
            profile={profile}
            onFollow={() => followMut.mutate(profile.id)}
            isPending={followMut.isPending}
          />
        ))}
      </div>
    </div>
  );
}

function RecommendationCard({ profile, onFollow, isPending }) {
  const [followed, setFollowed] = useState(false);
  const navigate = useNavigate();

  const handleFollow = () => {
    setFollowed(true);
    onFollow();
  };

  const initials = profile.name && profile.last_name ? `${profile.name[0]}${profile.last_name[0]}`.toUpperCase() : profile.username?.[0]?.toUpperCase() || '?';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      padding: '14px 16px',
      background: 'var(--card)',
      border: '0.5px solid var(--sage-line)',
      borderRadius: 'var(--radius)',
      minWidth: 110, maxWidth: 130,
      textAlign: 'center',
      boxShadow: 'var(--shadow-card)',
    }}>
      <div onClick={() => navigate(`/${profile.username}`)} style={{
        width: 44, height: 44, borderRadius: '50%',
        background: 'var(--sage)',
        color: 'var(--paper)',
        display: 'grid', placeItems: 'center',
        fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 600,
        overflow: 'hidden', flexShrink: 0, cursor: 'pointer'
      }}>
        {profile.avatar
          ? <img src={`http://localhost:8080${profile.avatar}`} alt={profile.username}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : initials}
      </div>
      <div style={{ minWidth: 0, width: '100%' }}>
        <ProfileUsername fontSize={13} username={profile.username} />
        {(profile.name || profile.last_name) && (
          <div className="faint" style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--sans)' }}>
            {[profile.name, profile.last_name].filter(Boolean).join(' ')}
          </div>
        )}
      </div>
      {followed ? (
        <span style={{ fontSize: 12, color: 'var(--sage-deep)', fontWeight: 600 }}>
          ✓ Following
        </span>
      ) : (
        <Btn variant="primary" size="sm" onClick={handleFollow} disabled={isPending}>
          Follow
        </Btn>
      )}
    </div>
  );
}