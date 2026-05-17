import { useNavigate } from "react-router-dom";
import { Btn } from ".";
import { getInitials } from "./ProfileAvatar";
import { useAuth } from "../context/AuthContext";

export default function UserRow({ rowUser, isFollowing, onToggle, onNavigate }) {
  const { user } = useAuth();

  const isAvatarUrl = rowUser?.avatar?.startsWith("http://") || rowUser?.avatar?.startsWith("https://")

  return <div className="profile-user-row">
    <button className="profile-user-avatar" onClick={onNavigate} style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
      {rowUser.avatar ? <img src={isAvatarUrl? rowUser.avatar : `http://localhost:8080${rowUser.avatar}`} alt={rowUser.username} /> : getInitials(rowUser.name, rowUser.last_name, rowUser.username)}
    </button>

    <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={onNavigate}>
      <div className="profile-user-name">@{rowUser.username}</div>
      {rowUser.name && <div className="profile-user-handle">{rowUser.name} {rowUser.last_name}</div>}
    </div>

    {rowUser.username != user.username && <Btn variant={isFollowing ? 'ghost' : 'primary'} size="sm" icon={isFollowing ? 'check' : 'user'} onClick={onToggle}>
      {isFollowing ? 'Following' : 'Follow'}
    </Btn>}
  </div>
}