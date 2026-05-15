import { Btn, Icon, ICONS } from ".";

export default function BlockRequestModal({ icon, title, message, onConfirm, onClose, confirmLabel, cancelLabel }) {
    return <div className="modal-overlay restriction" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal p-24 fade-up" style={{ maxHeight: "unset", textAlign: 'center', padding: 24, width: 560 }}>
            <Icon size={36} d={icon} style={{ color: 'var(--sage-deep)', alignSelf: 'center', marginBottom: 16, marginTop: 6 }} fill="currentColor" />
            <h2 style={{ marginTop: 0 }}>{title}</h2>

            <div className="muted" style={{ marginTop: 8, lineHeight: 1.6 }}>{message}</div>

            <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'center' }}>
                <Btn variant="ghost" onClick={cancelLabel}>{cancelLabel}</Btn>
                <Btn variant="primary" onClick={onConfirm}>{confirmLabel}</Btn>
            </div>
        </div>
    </div>
}