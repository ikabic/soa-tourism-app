import { useEffect, useState } from "react";
import { Icon, ICONS } from ".";
import { api as stakeholdersApi } from "../api/stakeholdersApi";
import { api as followersApi } from "../api/followersApi";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import UserRow from "./UserRow";
import { useAuth } from "../context/AuthContext";

export default function UserListModal({ token, title, userIds, onClose, currentUserFollowing = [] }) {
    const { user } = useAuth();

    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [localFollowing, setLocalFollowing] = useState(currentUserFollowing);

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!userIds?.length) { setLoading(false); return; }

        stakeholdersApi.getProfiles(userIds)
            .then(setProfiles)
            .finally(() => setLoading(false));
    }, [userIds]);

    useEffect(() => {
        setLocalFollowing(currentUserFollowing);
    }, [currentUserFollowing]);

    async function toggleFollow(userId) {
        const isFollowing = localFollowing.includes(userId);

        try {
            if (isFollowing) await followersApi.unfollow(userId, token);
            else await followersApi.follow(userId, token);

            await queryClient.invalidateQueries({ queryKey: ['profile', user?.username] });
        } catch (err) {
            console.error("Follow toggle failed:", err);
        }
    }

    return <div className="profile-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="profile-modal fade-up">
            <div className="profile-modal-header">
                <h3>{title}</h3>
                <button className="btn-icon" onClick={onClose}>
                    <Icon d={ICONS.close} size={16} />
                </button>
            </div>

            <div className="profile-modal-list">
                {loading && <p className="profile-bio-empty" style={{ textAlign: 'center', padding: '24px 0' }}>Loading…</p>}

                {!loading && profiles.length === 0 && <div className="profile-bio-empty" style={{ textAlign: 'center', padding: '24px 0' }}>No one here yet.</div>}

                {profiles.map((u) =>
                    <UserRow key={u.id} rowUser={u} isFollowing={localFollowing.includes(u.id)} onToggle={() => toggleFollow(u.id)} onNavigate={() => { navigate(`/${u.username}`); onClose(); }} />
                )}
            </div>
        </div>
    </div>
}