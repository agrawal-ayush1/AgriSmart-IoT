export const WeatherSummary = ({ temperature, humidity, isRaining, rainMm, moisture }) => (
  <div className="glass-card" style={{ animationDelay:"0.15s" }}>
    <div className="card-icon bg-blue">🌤</div>
    <div className="card-label">Weather Summary · Bengaluru</div>
    {[
      { icon:"🌡", label:"Temperature",    val:`${temperature}°C` },
      { icon:"💧", label:"Humidity",       val:`${humidity}%` },
      { icon:"🌧", label:"Rain",           val: isRaining ? `${rainMm} mm` : "None" },
      { icon:"⛅", label:"Condition",      val: isRaining ? "Rainy" : temperature > 34 ? "Hot & Dry" : "Clear" },
      { icon:"🏜", label:"Irrigation Need", val: isRaining ? "Hold" : moisture < 40 ? "Immediate" : "None" },
    ].map(w => (
      <div className="weather-row" key={w.label}>
        <span className="weather-icon">{w.icon}</span>
        <div>
          <div className="weather-label">{w.label}</div>
          <div className="weather-val">{w.val}</div>
        </div>
      </div>
    ))}
  </div>
);
