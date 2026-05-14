import { Btn, Icon, ICONS } from ".";

export default function DeleteModal({ title = "Confirm delete", message = "Are you sure? This cannot be undone.", onConfirm, onClose, confirmLabel = "Delete", isPending = false, }) {
    return <div className="profile-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="profile-modal fade-up" style={{ maxHeight: "unset" }}>
            <div className="profile-modal-header">
                <h3>{title}</h3>
                <button className="btn-icon" onClick={onClose} disabled={isPending}>
                    <Icon d={ICONS.close} size={16} />
                </button>
            </div>

            <div style={{ padding: "24px 24px 8px" }}>
                <p style={{ fontFamily: "var(--sans)", fontSize: 14.5, color: "var(--ink-soft)", lineHeight: 1.6, margin: 0 }}>
                    {message}
                </p>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 24px 20px" }}>
                <Btn variant='ghost' size='sm' onClick={onClose} disabled={isPending}>
                    Cancel
                </Btn>
                <button className="btn btn-danger btn-sm" onClick={onConfirm} disabled={isPending}>
                    {isPending ? "Deleting…" : confirmLabel}
                </button>
            </div>
        </div>
    </div>
}