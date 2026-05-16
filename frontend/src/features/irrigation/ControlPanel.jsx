export const ControlPanel = ({ pumpActive, togglePump, autoMode, toggleAuto }) => (
  <div className="glass-card" style={{ animationDelay:"0.1s" }}>
    <div className="card-icon bg-primary">⚙️</div>
    <div className="card-label">Control Panel</div>
    <div className="control-panel">
      <button
        className={`pump-toggle ${pumpActive ? "pump-on" : "pump-off"}`}
        onClick={togglePump}
      >
        {pumpActive ? "💧 Pump Running" : "⏹ Pump Off"}
      </button>
      <button
        className="pump-toggle"
        style={autoMode
          ? { background:"rgba(45,212,191,0.15)", color:"var(--teal)", border:"1px solid rgba(45,212,191,0.3)" }
          : { background:"rgba(245,166,35,0.12)", color:"var(--amber)", border:"1px solid rgba(245,166,35,0.3)" }}
        onClick={toggleAuto}
      >
        🤖 {autoMode ? "Auto Mode ON" : "Manual Mode"}
      </button>
      {[
        { label:"Target Moisture",    val:`${autoMode ? "35–70" : "—"}%` },
        { label:"Pump Duration",       val: pumpActive ? "Running" : "—" },
        { label:"Auto Trigger",        val: autoMode ? "< 35%" : "Disabled" },
        { label:"Auto Stop",           val: autoMode ? "> 70% or Rain" : "Disabled" },
      ].map(s => (
        <div className="mini-stat" key={s.label}>
          <span className="mini-stat-label">{s.label}</span>
          <span className="mini-stat-val" style={{ color:"var(--text-dim)" }}>{s.val}</span>
        </div>
      ))}
    </div>
  </div>
);
