import { useState } from "react";
import { Btn, ErrBanner } from ".";


export default function ProfileEditForm({ token, profile, onSave, onCancel }) {
    const [form, setForm] = useState({
        name: profile.name,
        last_name: profile.last_name,
        motto: profile.motto,
        biography: profile.biography,
    });

    const [err, setErr] = useState(null);

    function set(key, value) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function handleSave() {
        if (!form.name.trim()) return setErr('First name is required.');
        setErr(null);
        onSave(form, token);
    }

    return <div className="profile-edit-card fade-up">
        <div className="eyebrow" style={{ marginBottom: 20 }}>Edit profile</div>

        <div className="col gap-20">
            <div className="profile-edit-grid">
                <div className="field">
                    <label className="field-label">First name</label>
                    <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} />
                </div>
                
                <div className="field">
                    <label className="field-label">Last name</label>
                    <input className="input" value={form.last_name} onChange={(e) => set('last_name', e.target.value)} />
                </div>
            </div>

            <div className="field">
                <label className="field-label">Motto</label>
                <input className="input" placeholder="A short phrase that captures you…" value={form.motto} onChange={(e) => set('motto', e.target.value)} maxLength={120} />
                <span className="field-hint">{form.motto?.length ?? 0}/120</span>
            </div>

            <div className="field">
                <label className="field-label">Biography</label>
                <textarea className="textarea" placeholder="Tell visitors a little about yourself…" value={form.biography} onChange={(e) => set('biography', e.target.value)} style={{ minHeight: 130 }} />
            </div>

            {err && <ErrBanner onClose={() => setErr(null)}>{err}</ErrBanner>}

            <div className="row gap-8" style={{ justifyContent: 'flex-end' }}>
                <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
                <Btn variant="primary" icon="check" onClick={handleSave}>Save changes</Btn>
            </div>
        </div>
    </div>
}