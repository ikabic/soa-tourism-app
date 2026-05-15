import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/tourApi';
import { useAuth } from '../context/AuthContext';
import { Btn, ErrBanner, Icon, ICONS, ProfileUsername } from '../components';
import ProfileAvatar from '../components/ProfileAvatar';

export default function AdminUsersPage() {
  const { token } = useAuth();
  const qc = useQueryClient();

  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.getAllUsers(token),
  });

  const visibleUsers = users.filter((u) => u.role !== 'admin');

  const blockMutation = useMutation({
    mutationFn: (id) => api.blockUser(id, token),
    onSuccess: () => {
      qc.invalidateQueries(['admin-users']);
    },
  });

  if (isLoading) {
    return (
      <div className="container" style={{ padding: 40 }}>
        Loading users…
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: 40 }}>
        <ErrBanner>{error.message}</ErrBanner>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 0 80px' }}>
      <div style={{ marginBottom: 28 }}>
        <span className="eyebrow">Administration</span>

        <h1 style={{ marginTop: 6 }}>
          User management
        </h1>

        <p className="muted" style={{ marginTop: 6, maxWidth: 620 }}>
          Review registered users and block accounts that violate platform rules.
        </p>
      </div>

      <div className="col gap-16">
        {visibleUsers.map((u, idx) => (
          <div
            key={u.ID}
            className="card fade-up"
            style={{
              padding: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20,
              animationDelay: `${idx * 40}ms`,
            }}
          >
            <div className="row gap-16">
              <ProfileAvatar size={64} isOwn={false} profile={u} />

              <div className="col gap-8">
                <ProfileUsername username={u.username} fontSize={16} />

                <div className="muted" style={{ fontSize: 14, marginTop: -8 }}>
                  {u.email}
                </div>

                <div className="row gap-8">
                  <span className="badge">
                    {u.role}
                  </span>

                  {u.isBlocked && (
                    <span className="badge badge-archived">
                      Blocked
                    </span>
                  )}
                </div>
              </div>
            </div>

            {!u.isBlocked ? (
              <Btn
                variant="secondary"
                size="sm"
                icon="close"
                disabled={blockMutation.isPending}
                onClick={() => blockMutation.mutate(u.ID)}
              >
                Block user
              </Btn>
            ) : (
              <span className="faint" style={{ fontSize: 13 }}>
                User blocked
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}