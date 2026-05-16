export const MetricCard = ({ icon, iconBg, label, value, unit, badge, badgeBg, badgeColor, delay = 0 }) => (
  <div className="glass-card" style={{ animationDelay: `${delay}s` }}>
    <div className="card-icon" style={{ background: iconBg }}>{icon}</div>
    <div className="card-label">{label}</div>
    <div className="card-value" style={{ color: badgeColor || "var(--text)" }}>{value}</div>
    {unit && <div className="card-unit">{unit}</div>}
    {badge && (
      <span className="card-badge" style={{ background: badgeBg, color: badgeColor }}>
        {badge}
      </span>
    )}
  </div>
);
