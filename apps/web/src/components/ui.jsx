import { AlertCircle, CheckCircle2, Clock3, ExternalLink, LoaderCircle } from "lucide-react";

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}
export function SectionTitle({ title, description, action }) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function StatCard({ icon: Icon, label, value, hint, tone = "teal" }) {
  return (
    <article className={`stat-card tone-${tone}`}>
      <span className="stat-icon">
        <Icon size={18} aria-hidden="true" />
      </span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{hint}</small>
      </div>
    </article>
  );
}
export function StatusBadge({ children, tone = "neutral" }) {
  return <span className={`status-badge status-${tone}`}>{children}</span>;
}
export function Panel({ children, className = "" }) {
  return <section className={`panel ${className}`}>{children}</section>;
}
export function LoadingState({ label = "Loading" }) {
  return (
    <div className="state-box" role="status">
      <LoaderCircle className="spin" size={20} />
      {label}
    </div>
  );
}
export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-box state-error" role="alert">
      <AlertCircle size={20} />
      <span>{message}</span>
      {onRetry && (
        <button className="text-button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
export function EmptyState({ icon: Icon = CheckCircle2, title, description, action }) {
  return (
    <div className="empty-state">
      <span>
        <Icon size={22} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function SourceAttribution({ name, href }) {
  return (
    <a className="source-link" href={href} target="_blank" rel="noreferrer">
      {name}
      <ExternalLink size={13} />
    </a>
  );
}
export function Freshness({ timestamp }) {
  if (!timestamp)
    return (
      <span className="freshness">
        <Clock3 size={13} /> Update time unavailable
      </span>
    );
  return (
    <span className="freshness">
      <Clock3 size={13} /> Updated {new Date(timestamp).toLocaleString()}
    </span>
  );
}
export function ProgressBar({ value, label }) {
  const safe = Math.max(0, Math.min(100, value || 0));
  return (
    <div className="progress-wrap">
      <div className="progress-label">
        <span>{label}</span>
        <strong>{safe}%</strong>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label={label}
        aria-valuenow={safe}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <span style={{ width: `${safe}%` }} />
      </div>
    </div>
  );
}
export function Field({ label, id, hint, error, ...props }) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...props}
      />
      {hint && <small id={`${id}-hint`}>{hint}</small>}
      {error && (
        <small id={`${id}-error`} className="field-error">
          {error}
        </small>
      )}
    </label>
  );
}
export function Button({ children, variant = "primary", icon: Icon, ...props }) {
  return (
    <button className={`button button-${variant}`} {...props}>
      {Icon && <Icon size={16} aria-hidden="true" />}
      {children}
    </button>
  );
}
