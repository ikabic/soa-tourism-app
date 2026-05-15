import { useRef } from "react";
import { Icon, ICONS } from ".";
import { useNavigate } from "react-router-dom";

export function getInitials(firstName, lastName, username) {
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (firstName) return firstName[0].toUpperCase();
    if (username) return username[0].toUpperCase();
    return '?';
}

export default function ProfileAvatar({ profile, isOwn, onFileSelected, isProfilePage = false, size }) {
    const fileInputRef = useRef(null);
    const fontSize = size / 2.7;
    const navigate = useNavigate();

    function handleChange(e) {
        const file = e.target.files?.[0];
        if (file) onFileSelected(file);
        e.target.value = '';
    }

    return <div className="profile-avatar-wrap" onClick={() => navigate(`/${profile.username}`)}>
        <div className={isProfilePage ? "profile-avatar extended" : "profile-avatar"} style={{ height: size, width: size, fontSize: fontSize }}>
            {profile.avatar ? <img src={`http://localhost:8080${profile.avatar}`} alt={profile.username} /> : getInitials(profile.name, profile.last_name, profile.username)}
        </div>
        {isOwn && <>
            <button className="profile-avatar-edit-btn" onClick={() => fileInputRef.current?.click()} title="Change avatar">
                <Icon d={ICONS.edit} size={13} stroke={1.8} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleChange} />
        </>
        }
    </div>
}