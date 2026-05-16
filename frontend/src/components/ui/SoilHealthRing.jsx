export const SoilHealthRing = ({ score }) => {
  const color = score >= 70 ? "var(--green)" : score >= 45 ? "var(--amber)" : "var(--red)";
  const r = 44, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="soil-health-ring">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
      </svg>
      <div className="soil-score-text">
        <span style={{ color }}>{score}</span>
        <span className="soil-score-label">HEALTH</span>
      </div>
    </div>
  );
};
