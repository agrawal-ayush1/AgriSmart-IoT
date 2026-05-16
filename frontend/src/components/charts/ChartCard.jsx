export const ChartCard = ({ title, sub, children, className = "", delay = 0, colSpan }) => (
  <div
    className={`glass-card chart-card ${className}`}
    style={{ animationDelay: `${delay}s`, gridColumn: colSpan ? `span ${colSpan}` : undefined }}
  >
    <div className="chart-title">{title}</div>
    <div className="chart-sub">{sub}</div>
    {children}
  </div>
);
