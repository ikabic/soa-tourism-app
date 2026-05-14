import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/tourApi';
import { useAuth } from '../context/AuthContext';
import { Btn, Difficulty, Tag, ErrBanner, Icon, ICONS } from '../components';

export default function CreateTourPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [tagsRaw, setTagsRaw] = useState('');
  const [err, setErr] = useState(null);

  const tagsPreview = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);

  const createMut = useMutation({
    mutationFn: (data) => api.createTour(data, token),
    onSuccess: (tour) => {
      qc.invalidateQueries({ queryKey: ['my-tours'] });
      navigate(`/tours/${tour.id}`);
    },
    onError: (e) => setErr(e.message),
  });

  function submit() {
    if (!name.trim()) return setErr('Give your tour a name to continue.');
    if (!description.trim()) return setErr('Add a short description so travellers know what to expect.');
    setErr(null);
    createMut.mutate({
      name: name.trim(),
      description: description.trim(),
      difficulty,
      tags: tagsPreview,
      price: 0,
    });
  }

  return (
    <div className="container" style={{ padding: '40px 0 80px', maxWidth: 880 }}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/my-tours')} style={{ marginBottom: 18 }}>
        <Icon d={ICONS.chevL} size={14} /> Back to my tours
      </button>

      <div style={{ marginBottom: 28 }}>
        <span className="eyebrow">New entry</span>
        <h1 style={{ marginTop: 6 }}>Sketch a new tour</h1>
        <p className="muted" style={{ marginTop: 6, maxWidth: 560 }}>
          Start with the essentials. You'll plot key points on the map and add durations on the next screen.
        </p>
      </div>

      <div className="card p-32 fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label className="field-label">Tour name</label>
          <input className="input" placeholder="e.g. Lake Bled & Vintgar Gorge Loop"
            value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label className="field-label">Description</label>
          <textarea className="textarea" rows={5}
            placeholder="What makes this walk special? Best season, terrain, anything travellers should know…"
            value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="field">
          <label className="field-label">Difficulty</label>
          <select className="select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
          <span className="field-hint" style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            Currently: <Difficulty value={difficulty} />
          </span>
        </div>

        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label className="field-label">Tags</label>
          <input className="input" placeholder="lake, alps, sunrise"
            value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)} />
          <span className="field-hint">Comma-separated. Help travellers find your tour.</span>
          {tagsPreview.length > 0 && (
            <div className="row gap-6 wrap" style={{ marginTop: 8 }}>
              {tagsPreview.map((t) => <Tag key={t}>{t}</Tag>)}
            </div>
          )}
        </div>

        {err && (
          <div style={{ gridColumn: '1 / -1' }}>
            <ErrBanner onClose={() => setErr(null)}>{err}</ErrBanner>
          </div>
        )}

        <div style={{
          gridColumn: '1 / -1',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderTop: '0.5px dashed var(--sage-line)', paddingTop: 18, marginTop: 4,
        }}>
          <span className="hand">Saved as a draft — only you will see it.</span>
          <div className="row gap-8">
            <Btn variant="ghost" onClick={() => navigate('/my-tours')}>Cancel</Btn>
            <Btn variant="primary" iconRight="arrow" onClick={submit} disabled={createMut.isPending}>
              {createMut.isPending ? 'Creating…' : 'Create & continue'}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
