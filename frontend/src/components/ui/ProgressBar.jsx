export const ProgressBar = ({ value, color }) => (
  <div className="progress-track">
    <div className="progress-fill" style={{ width: `${value}%`, background: color }} />
  </div>
);
