import { useRef } from "react";
import { Icon, ICONS } from ".";

export function getInitials(firstName, lastName, username) {
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (firstName) return firstName[0].toUpperCase();
    if (username) return username[0].toUpperCase();
    return '?';
}

export default function ProfileAvatar({ profile, isOwn, onFileSelected }) {
    const fileInputRef = useRef(null);

    function handleChange(e) {
        const file = e.target.files?.[0];
        if (file) onFileSelected(file);
        e.target.value = '';
    }

    return <div className="profile-avatar-wrap">
        <div className="profile-avatar">
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