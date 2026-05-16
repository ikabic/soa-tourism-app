import { useNavigate } from 'react-router-dom';
import { difficultyClass, difficultyTicks, formatDuration } from '../utils/helpers';

export const ICONS = {
  leaf:    "M5 19c10 0 14-7 14-14-9 0-14 4-14 14Zm0 0c2-4 5-7 9-9",
  plus:    "M12 5v14M5 12h14",
  pin:     "M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  map:     "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14",
  ruler:   "M3 14 14 3l7 7L10 21l-7-7Zm3-3 2 2m1-5 2 2m1-5 2 2",
  clock:   "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v5l3 2",
  archive: "M3 7h18v3H3V7Zm2 3h14v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-9Zm5 4h4",
  upload:  "M12 16V4m0 0-4 4m4-4 4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3",
  refresh: "M3 12a9 9 0 0 1 15-6.7L21 8M21 4v4h-4M21 12a9 9 0 0 1-15 6.7L3 16m0 4v-4h4",
  check:   "M5 12l5 5 9-11",
  close:   "M6 6l12 12M18 6 6 18",
  log:     "M10 17l-5-5 5-5M5 12h13M14 21h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-4",
  user:    "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9c0-4 3-7 7-7s7 3 7 7",
  edit:    "M4 20h4l11-11-4-4L4 16v4Zm10-13 4 4",
  trash:   "M4 7h16M9 7V4h6v3m-7 0v13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7",
  search:  "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm6-2 4 4",
  star:    "M12 3l2.6 5.6 6.4.7-4.8 4.4 1.3 6.3L12 17l-5.5 3 1.3-6.3L3 9.3l6.4-.7L12 3Z",
  arrow:   "M5 12h14m-5-5 5 5-5 5",
  chevR:   "M9 6l6 6-6 6",
  chevL:   "M15 6l-6 6 6 6",
  cart:    "M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z",
  heart:   "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z",
  walk:    "M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM12 7v5M12 9l-4 2M12 9l3-2M12 12l-2 6M12 12l2 5",
  bike:    "M5 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm12 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6.5 13l3-5h4l1.5 5M11 8l-1-3h-2",
  car:     "M4 13l2-5h10l2 5M3 13h16v4a1 1 0 0 1-1 1h-1v-1H7v1H6a1 1 0 0 1-1-1v-4Zm3 3h2m6 0h2",
  compass: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-3.5-4.5 2-7 5-2-2 7-5 2Z",
  sun:     "M12 4V2m0 20v-2M4 12H2m20 0h-2m-3-7-1.5 1.5M6.5 6.5 5 5m0 14 1.5-1.5m11 0L19 19M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
  lock:    "M12 1a5 5 0 0 0-5 5v5H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5Zm-3 10V6a3 3 0 1 1 6 0v5H9Zm3 3a1.5 1.5 0 0 1 1 2.6V18h-2v-1.4A1.5 1.5 0 0 1 12 14Z",
};

export function Icon({ d, size = 18, stroke = 1.5, fill = 'none', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
      stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round" style={style}>
      {typeof d === 'string' ? <path d={d} /> : d}
    </svg>
  );
}

export function Btn({ children, variant = 'primary', size, icon, iconRight, ariaLabel, iconOnly, onClick, disabled, type = 'button', style, title }) {
  const classes = ['btn', `btn-${variant}`];
  if (size === 'sm') classes.push('btn-sm');
  if (size === 'lg') classes.push('btn-lg');
  if (size === 'vlg') classes.push('btn-vlg');
  if (iconOnly) classes.push('btn-icon');
  return (
    <button
      title={title}
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{ opacity: disabled ? 0.55 : 1, ...(style || {}) }}
      className={classes.join(' ').trim()}
    >
      {icon && <Icon d={ICONS[icon]} size={16} />}
      {children}
      {iconRight && <Icon d={ICONS[iconRight]} size={16} />}
    </button>
  );
}

export function Brand() {
  return (
    <div className="nav-brand">
      <span className="leaf">✈</span>
      <span>YetAnotherTourismApp</span>
    </div>
  );
}

export function StatusBadge({ status }) {
  const cls = status === 'Published' ? 'badge-published'
    : status === 'Archived' ? 'badge-archived'
    : 'badge-draft';
  return <span className={`badge ${cls}`}><span className="dot" />{status}</span>;
}

export function Difficulty({ value, showLabel = true }) {
  const count = value === 'Easy' ? 1 : value === 'Hard' ? 3 : 2;
  const cls = value === 'Easy' ? 'diff-easy' : value === 'Hard' ? 'diff-hard' : 'diff-med';
  return (
    <span className={`diff ${cls}`}>
      <span style={{ display: 'inline-flex', gap: 1, lineHeight: 1 }}>
        {[1, 2, 3].map((i) => (
          <span key={i} style={{ opacity: i <= count ? 1 : 0.2, fontSize: 11 }}>❯</span>
        ))}
      </span>
      {showLabel && <span>{value}</span>}
    </span>
  );
}

export function Tag({ children }) {
  return <span className="tag">#{children}</span>;
}

export function Placeholder({ label, height = 140, tone = 'sage' }) {
  const stripe =
    tone === 'terra' ? 'var(--terracotta)'
    : tone === 'gold' ? 'var(--gold)'
    : 'var(--sage-deep)';
  return (
    <div style={{
      height,
      borderRadius: 'var(--radius-lg)',
      position: 'relative',
      overflow: 'hidden',
      background: `repeating-linear-gradient(135deg,
        color-mix(in oklch, ${stripe} 14%, var(--paper)) 0 10px,
        color-mix(in oklch, ${stripe} 8%, var(--paper)) 10px 20px)`,
      border: '0.5px solid var(--sage-line)',
      display: 'grid',
      placeItems: 'center',
    }}>
      <span style={{
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 11,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: 'var(--ink-faint)',
        background: 'color-mix(in oklch, var(--paper) 80%, transparent)',
        padding: '4px 10px',
        borderRadius: 4,
      }}>
        {label}
      </span>
    </div>
  );
}

export function TransportPill({ type, mins }) {
  const ic = type === 'Walking' ? 'walk' : type === 'Bicycle' ? 'bike' : 'car';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 10px',
      background: 'var(--paper-deep)',
      border: '0.5px solid var(--sage-line)',
      borderRadius: 6,
      fontSize: 12.5,
      color: 'var(--ink-soft)',
    }}>
      <Icon d={ICONS[ic]} size={14} stroke={1.6} style={{ color: 'var(--sage-deep)' }} />
      <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{type}</span>
      <span style={{ color: 'var(--ink-faint)' }}>· {formatDuration(mins)}</span>
    </span>
  );
}

export function ErrBanner({ children, onClose }) {
  return (
    <div className="err-banner fade-up">
      <Icon d="M12 9v4m0 4h.01M5 19h14a2 2 0 0 0 1.7-3l-7-12a2 2 0 0 0-3.4 0l-7 12A2 2 0 0 0 5 19Z" size={16} />
      <div className="grow">{children}</div>
      {onClose && (
        <button className="btn-icon" onClick={onClose} style={{ width: 22, height: 22, color: 'currentColor' }}>
          <Icon d={ICONS.close} size={14} />
        </button>
      )}
    </div>
  );
}

export function ProfileUsername({ username, fontSize = 14, color = 'var(--ink)', isInline = false }) {
  const navigate = useNavigate();

  return <div className='profile-username' style={{ color: color, fontSize: fontSize, display: isInline ? 'inline' : 'block' }} onClick={() => navigate(`/${username}`)}> @{username} </div>
}
