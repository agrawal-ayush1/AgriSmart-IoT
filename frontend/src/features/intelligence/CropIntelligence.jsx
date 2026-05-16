import { CROPS, CROP_ICONS, FERT_INFO } from "../../constants/config";

export const CropIntelligence = ({ 
  selectedCrop, setSelectedCrop, nextCrop, predictedYield, 
  moisture, temperature, isRaining, fertilizer 
}) => {
  const fertInfo = FERT_INFO[fertilizer] || FERT_INFO["NPK"];
  return (
    <>
      <div className="glass-card" style={{ animationDelay:"0.1s" }}>
        <div className="card-icon bg-primary">🌾</div>
        <div className="card-label">Crop Management</div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize:"0.72rem", color:"var(--text-muted)", fontFamily:"var(--font-mono)", marginBottom:6 }}>CURRENT CROP</div>
          <select
            className="crop-select"
            value={selectedCrop}
            onChange={e => setSelectedCrop(e.target.value)}
          >
            {CROPS.map(c => (
              <option key={c} value={c}>{CROP_ICONS[c]} {c}</option>
            ))}
          </select>
        </div>
        <div className="rotation-chain">
          <span className="chain-item active">{CROP_ICONS[selectedCrop]} {selectedCrop}</span>
          <span className="chain-arrow">→</span>
          <span className="chain-item next">{CROP_ICONS[nextCrop]} {nextCrop}</span>
        </div>
        <div style={{ marginTop:12, fontSize:"0.72rem", color:"var(--text-muted)", fontFamily:"var(--font-mono)" }}>
          NEXT RECOMMENDED CROP
        </div>
        <div style={{ fontSize:"1.1rem", fontWeight:800, color:"var(--amber)", marginTop:2 }}>
          {CROP_ICONS[nextCrop]} {nextCrop}
        </div>
      </div>

      <div className="glass-card" style={{ animationDelay:"0.15s" }}>
        <div className="card-icon bg-teal">📊</div>
        <div className="card-label">AI Yield Prediction</div>
        <div className="card-value teal">{predictedYield.toLocaleString()}</div>
        <div className="card-unit">kg per acre</div>
        <div style={{ marginTop: 14 }}>
          {[
            { label: "Moisture Factor",     val: moisture >= 60 ? "+10%" : moisture < 30 ? "-25%" : "±0%",     col: moisture < 30 ? "var(--red)" : "var(--primary)" },
            { label: "Temperature Factor",  val: temperature > 35 ? "-20%" : temperature >= 25 ? "+10%" : "±0%", col: temperature > 35 ? "var(--red)" : "var(--primary)" },
            { label: "Rain Bonus",          val: isRaining ? "+15%" : "±0%",    col: isRaining ? "var(--teal)" : "var(--text-dim)" },
          ].map(s => (
            <div className="mini-stat" key={s.label}>
              <span className="mini-stat-label">{s.label}</span>
              <span className="mini-stat-val" style={{ color: s.col }}>{s.val}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ animationDelay:"0.2s" }}>
        <div className="card-icon bg-amber">🌿</div>
        <div className="card-label">Fertilizer Recommendation</div>
        <div className="fert-display">
          <div className="fert-icon">{fertInfo.icon}</div>
          <div className="fert-name amber">{fertilizer}</div>
          <div className="fert-desc">{fertInfo.desc}</div>
        </div>
        <div style={{ marginTop: 8 }}>
          {[
            { label: "Crop Type",   val: selectedCrop },
            { label: "Moisture",    val: `${moisture}%` },
            { label: "Temperature", val: `${temperature}°C` },
          ].map(s => (
            <div className="mini-stat" key={s.label}>
              <span className="mini-stat-label">{s.label}</span>
              <span className="mini-stat-val">{s.val}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
