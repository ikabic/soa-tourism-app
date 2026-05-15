import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { Btn, Icon, ICONS, ErrBanner } from '../components';
import { api } from '../api/stakeholdersApi';
import { api as followersApi } from '../api/followersApi';

import UserListModal from '../components/UserListModal';
import ProfileEditForm from '../components/ProfileEditForm';
import ProfileAvatar from '../components/ProfileAvatar';

import '../styles/ProfilePage.css';

export default function ProfilePage() {
    const { username } = useParams();
    const { user, token } = useAuth();
    const isOwn = user?.username === username;
    const queryClient = useQueryClient();

    const { data: profile, isLoading, error } = useQuery({
        queryKey: ['profile', username],
        queryFn: () => api.getProfileByUsername(token, username)
    });

    const { data: myProfile } = useQuery({
        queryKey: ['profile', user?.username],
        queryFn: () => api.getProfileByUsername(token, user?.username),
        enabled: !!user && !isOwn,
    });

    const myFollowing = isOwn ? profile?.following : myProfile?.following;

    async function toggleFollow() {
        try {
            if (myFollowing?.includes(profile.id)) await followersApi.unfollow(profile.id, token);
            else await followersApi.follow(profile.id, token);

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['profile', username] }),
                queryClient.invalidateQueries({ queryKey: ['profile', user?.username] }),
            ]);
        } catch (err) {
            console.error("Follow toggle failed:", err);
        }
    }

    const updateMutation = useMutation({
        mutationFn: (patch) => api.updateProfile(patch, token),
        onSuccess: () => {
            queryClient.invalidateQueries(['profile', username]);
            setEditing(false);
        }
    });

    function handleFileSelected(file) {
        updateMutation.mutate({ ...profile, avatar: file });
    }

    const [modal, setModal] = useState(null); // 'followers' | 'following' | null
    const [editing, setEditing] = useState(false);

    function handleSaveProfile(patch) {
        updateMutation.mutate(patch);
    }

    if (isLoading) {
        return <div className="profile-body">
            <div className="container">
                <p style={{ color: 'var(--ink-faint)', fontSize: 14 }}>Loading profile…</p>
            </div>
        </div>
    }

    if (error) {
        return <div className="profile-body">
            <div className="container">
                <ErrBanner message={error.message} />
            </div>
        </div>
    }

    const displayName = [profile.name, profile.last_name].filter(Boolean).join(' ') || 'New User';

    return <>
        <div className="profile-hero">
            <div className="container">
                <div className="profile-hero-identity">
                    <ProfileAvatar profile={profile} isOwn={isOwn} onFileSelected={handleFileSelected} isProfilePage={true} size={96} />

                    <div className="profile-hero-info">
                        <div className="profile-hero-name-row">
                            <h1 className="profile-name">{displayName}</h1>
                            {isOwn && <span className="profile-own-badge">You</span>}
                        </div>
                        <div className="profile-username-info">@{profile.username}</div>
                        <p className={`profile-motto ${!profile?.motto ? 'is-placeholder' : ''}`}>
                            {profile?.motto ? `“${profile.motto}”` : 'No motto set'}
                        </p>
                    </div>

                    <div className="profile-hero-action">
                        {isOwn ?
                            <Btn variant={editing ? 'ghost' : 'quiet'} size="sm" icon="edit" onClick={() => setEditing((v) => !v)}>
                                {editing ? 'Cancel' : 'Edit profile'}
                            </Btn>
                            :
                            <Btn variant={myFollowing?.includes(profile.id) ? 'ghost' : 'primary'} size="sm" icon={myFollowing?.includes(profile.id) ? 'check' : 'user'} onClick={() => toggleFollow(profile.userId)}>
                                {myFollowing?.includes(profile.id) ? 'Following' : 'Follow'}
                            </Btn>
                        }
                    </div>
                </div>

                <div className="profile-stats-row">
                    <button className="profile-stat-pill" onClick={() => setModal('followers')}>
                        <span className="profile-stat-num">{profile.followers?.length || '0'}</span>
                        <span className="profile-stat-label">Followers</span>
                    </button>
                    <div className="profile-stat-divider" />
                    <button className="profile-stat-pill" onClick={() => setModal('following')}>
                        <span className="profile-stat-num">{profile.following?.length || '0'}</span>
                        <span className="profile-stat-label">Following</span>
                    </button>
                </div>

                <div className="profile-tabs">
                    <button className="profile-tab active">About</button>
                </div>
            </div>
        </div>

        <div className="profile-body">
            <div className="container col gap-20">
                {editing && isOwn ?
                    <ProfileEditForm token={token} profile={profile} onSave={handleSaveProfile} onCancel={() => setEditing(false)} isSaving={updateMutation.isPending} />
                    :
                    <div className="profile-bio-card fade-up">
                        <div className="profile-section-heading">
                            <span className="eyebrow">Biography</span>
                        </div>
                        {profile.biography ?
                            <p className="profile-bio-text">{profile.biography}</p>
                            :
                            <p className="profile-bio-empty">{isOwn ? 'Add a biography to let others know who you are.' : 'No biography yet.'}</p>
                        }
                    </div>
                }
            </div>
        </div>

        {modal === 'followers' && <UserListModal title={`Followers · ${profile.followers?.length}`} userIds={profile.followers} onClose={() => setModal(null)} currentUserFollowing={myFollowing ?? []} token={token} />}

        {modal === 'following' && <UserListModal title={`Following · ${profile.following?.length}`} userIds={profile.following} onClose={() => setModal(null)} currentUserFollowing={myFollowing ?? []} token={token} />}
    </>
}