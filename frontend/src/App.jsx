import { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

import "./styles/globals.css";
import { ROTATION_MAP } from "./constants/config";
import { PredictionEngine } from "./utils/predictionEngine";

import { MetricCard } from "./components/ui/MetricCard";
import { ProgressBar } from "./components/ui/ProgressBar";
import { SoilHealthRing } from "./components/ui/SoilHealthRing";
import { ChartCard } from "./components/charts/ChartCard";
import { CustomTooltip } from "./components/charts/CustomTooltip";

import { DashboardHeader } from "./features/dashboard/DashboardHeader";
import { AlertBanner } from "./features/dashboard/AlertBanner";
import { WeatherSummary } from "./features/dashboard/WeatherSummary";
import { ControlPanel } from "./features/irrigation/ControlPanel";
import { CropIntelligence } from "./features/intelligence/CropIntelligence";

import { useSensorData } from "./hooks/useSensorData";

export default function SmartIrrigationDashboard() {
  // ── Live Sensor Data ──
  const {
    sensor1,
    sensor2,
    pumpActive,
    waterUsage,
    autoMode,
    togglePump,
    toggleAuto,
    setIsRaining: setServiceIsRaining,
    isLoading,
    isError,
    isConnected
  } = useSensorData();

  const averageMoisture = parseFloat(((sensor1 + sensor2) / 2).toFixed(1));

  // ── Weather state ──
  const [temperature, setTemperature]   = useState(28);
  const [humidity, setHumidity]         = useState(65);
  const [isRaining, setIsRaining]       = useState(false);
  const [rainMm, setRainMm]             = useState(0);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // ── Crop State ──
  const [selectedCrop, setSelectedCrop] = useState("Rice");

  // ── History ──
  const [moistureHistory, setMoistureHistory] = useState(
    Array.from({ length: 12 }, (_, i) => ({
      time: `${12 - i}m`, 
      sensor1: 50 + Math.round(Math.random() * 20 - 5),
      sensor2: 52 + Math.round(Math.random() * 20 - 5),
    })).reverse()
  );
  
  const [yieldHistory, setYieldHistory] = useState(
    ["Jan","Feb","Mar","Apr","May","Jun"].map(m => ({
      month: m,
      yield: 1400 + Math.round(Math.random() * 600),
    }))
  );
  
  const [waterHistory, setWaterHistory] = useState(
    Array.from({ length: 10 }, (_, i) => ({
      time: `${i + 1}:00`, usage: 80 + Math.round(Math.random() * 120),
    }))
  );
  
  const [soilHistory, setSoilHistory] = useState(
    Array.from({ length: 8 }, (_, i) => ({
      day: `D-${7 - i}`, health: 60 + Math.round(Math.random() * 30),
    })).reverse()
  );

  // ── Fetch weather ──
  useEffect(() => {
    const fetchWeather = async () => {
      setWeatherLoading(true);
      try {
        const res = await fetch("https://wttr.in/Bengaluru?format=j1");
        if (res.ok) {
          const data = await res.json();
          const cur = data.current_condition?.[0];
          if (cur) {
            setTemperature(parseFloat(cur.temp_C));
            setHumidity(parseFloat(cur.humidity));
            const precip = parseFloat(cur.precipMM || 0);
            setRainMm(precip);
            const raining = precip > 0.5;
            setIsRaining(raining);
            setServiceIsRaining(raining);
          }
        }
      } catch {
        // Fallback to simulated values
        setTemperature(28 + Math.round(Math.random() * 6 - 2));
        setHumidity(60 + Math.round(Math.random() * 20 - 5));
        const rainAmt = Math.random() > 0.7 ? parseFloat((Math.random() * 5).toFixed(1)) : 0;
        setRainMm(rainAmt);
        const raining = rainAmt > 0;
        setIsRaining(raining);
        setServiceIsRaining(raining);
      } finally {
        setWeatherLoading(false);
      }
    };
    fetchWeather();
    const wId = setInterval(fetchWeather, 5 * 60 * 1000);
    return () => clearInterval(wId);
  }, [setServiceIsRaining]);

  // ── Update History (Sync with live data) ──
  useEffect(() => {
    const ts = new Date().toLocaleTimeString("en-US",{ hour12:false, hour:"2-digit", minute:"2-digit", second:"2-digit" });
    setMoistureHistory(h => {
      if (h.length > 0 && h[h.length - 1].time === ts) return h;
      return [...h.slice(-19), { time: ts, sensor1, sensor2 }];
    });
  }, [sensor1, sensor2]);

  useEffect(() => {
    const ts = new Date().toLocaleTimeString("en-US",{ hour12:false, hour:"2-digit", minute:"2-digit" });
    setWaterHistory(wh => {
      if (wh.length > 0 && wh[wh.length - 1].time === ts) {
        const newHist = [...wh];
        newHist[newHist.length - 1] = { ...newHist[newHist.length - 1], usage: Math.max(newHist[newHist.length - 1].usage, waterUsage) };
        return newHist;
      }
      return [...wh.slice(-9), { time: ts, usage: waterUsage }];
    });
  }, [waterUsage]);

  // ── Update soil health history ──
  useEffect(() => {
    const id = setInterval(() => {
      const score = PredictionEngine.getSoilHealth(averageMoisture, temperature, waterUsage);
      setSoilHistory(h => {
        const ts = new Date().toLocaleTimeString("en-US",{ hour12:false, hour:"2-digit", minute:"2-digit" });
        return [...h.slice(-9), { day: ts, health: score }];
      });
    }, 10000);
    return () => clearInterval(id);
  }, [averageMoisture, temperature, waterUsage]);

  // ── Computed values (memoized) ──
  const nextCrop      = useMemo(() => ROTATION_MAP[selectedCrop], [selectedCrop]);
  const predictedYield = useMemo(
    () => PredictionEngine.calculateYield(selectedCrop, averageMoisture, temperature, isRaining, waterUsage),
    [selectedCrop, averageMoisture, temperature, isRaining, waterUsage]
  );
  const fertilizer    = useMemo(
    () => PredictionEngine.getFertilizer(selectedCrop, averageMoisture, temperature),
    [selectedCrop, averageMoisture, temperature]
  );
  const soilHealth    = useMemo(
    () => PredictionEngine.getSoilHealth(averageMoisture, temperature, waterUsage),
    [averageMoisture, temperature, waterUsage]
  );
  const efficiency    = useMemo(() => {
    if (waterUsage === 0) return 100;
    const ideal = averageMoisture * 8;
    return Math.min(100, Math.round((ideal / Math.max(1, waterUsage)) * 100));
  }, [averageMoisture, waterUsage]);

  // ── Yield chart data ──
  const updatedYieldHistory = useMemo(() => [
    ...yieldHistory.slice(0, -1),
    { month: "Now", yield: predictedYield },
  ], [yieldHistory, predictedYield]);

  // ── Alert message ──
  const alert = useMemo(() => {
    if (isError) return { type: "alert-red", msg: "🚨  IoT API Connection Failed — Retrying..." };
    if (isLoading) return { type: "alert-amber", msg: "⏳  Connecting to IoT Telemetry..." };
    if (isRaining) return { type: "alert-blue", msg: "🌧  Rain detected — pump paused automatically" };
    if (averageMoisture < 35) return { type: "alert-red",   msg: "⚠️  Low moisture — irrigation required" };
    if (averageMoisture > 75) return { type: "alert-green", msg: "✅  Soil moisture is optimal" };
    if (temperature > 36) return { type: "alert-amber", msg: "🌡  High temperature — monitor crop stress" };
    return { type: "alert-primary", msg: "🌿  All systems normal" };
  }, [isError, isLoading, averageMoisture, isRaining, temperature]);

  const soilColor = soilHealth >= 70
    ? "var(--green)" : soilHealth >= 45 ? "var(--amber)" : "var(--red)";
  const soilLabel = soilHealth >= 70 ? "Good" : soilHealth >= 45 ? "Moderate" : "Poor";

  return (
    <div className="dashboard">

      <DashboardHeader 
        pumpActive={pumpActive} 
        autoMode={autoMode} 
        weatherLoading={weatherLoading}
        isLoading={isLoading}
        isError={isError}
        isConnected={isConnected}
      />

      <AlertBanner alert={alert} />

      {/* ── Top Row (Sensors & Pump) ── */}
      <div className="section-title">Live Field Data</div>
      <div className="grid-4">
        <MetricCard delay={0.05}
          icon="🌱" iconBg="rgba(139, 92, 246, 0.15)"
          label="Sensor 1 Moisture" value={`${sensor1}%`}
          badge={sensor1 < 35 ? "LOW" : sensor1 > 75 ? "HIGH" : "OPTIMAL"}
          badgeBg={sensor1 < 35 ? "rgba(242,87,87,0.2)" : sensor1 > 75 ? "rgba(96,165,250,0.2)" : "rgba(139, 92, 246, 0.2)"}
          badgeColor={sensor1 < 35 ? "var(--red)" : sensor1 > 75 ? "var(--blue)" : "var(--primary)"}
        />
        <MetricCard delay={0.10}
          icon="🌿" iconBg="rgba(192, 132, 252, 0.15)"
          label="Sensor 2 Moisture" value={`${sensor2}%`}
          badge={sensor2 < 35 ? "LOW" : sensor2 > 75 ? "HIGH" : "OPTIMAL"}
          badgeBg={sensor2 < 35 ? "rgba(242,87,87,0.2)" : sensor2 > 75 ? "rgba(96,165,250,0.2)" : "rgba(192, 132, 252, 0.2)"}
          badgeColor={sensor2 < 35 ? "var(--red)" : sensor2 > 75 ? "var(--blue)" : "var(--accent)"}
        />
        <MetricCard delay={0.15}
          icon="⚙️" iconBg={pumpActive ? "rgba(139, 92, 246, 0.15)" : "rgba(255,255,255,0.05)"}
          label="Pump Status" value={pumpActive ? "ON" : "OFF"}
          unit={autoMode ? "Auto Mode" : "Manual Override"}
          badgeColor={pumpActive ? "var(--primary)" : "var(--text-dim)"}
        />
        <MetricCard delay={0.20}
          icon="🚰" iconBg="rgba(139, 92, 246, 0.1)"
          label="Water Usage" value={waterUsage.toFixed(0)}
          unit="litres total"
          badgeColor="var(--primary)"
        />
      </div>

      {/* ── Second Row (Climate & Efficiency) ── */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        <MetricCard delay={0.25}
          icon="🌡" iconBg="rgba(245,166,35,0.15)"
          label="Temperature" value={`${temperature}°`}
          unit="Celsius"
          badgeColor={temperature > 35 ? "var(--red)" : "var(--amber)"}
        />
        <MetricCard delay={0.30}
          icon="💨" iconBg="rgba(96,165,250,0.15)"
          label="Humidity" value={`${humidity}%`}
          unit="Relative"
          badgeColor="var(--blue)"
        />
        <MetricCard delay={0.35}
          icon="🌧" iconBg="rgba(45,212,191,0.15)"
          label="Rainfall" value={isRaining ? `${rainMm}` : "0"}
          unit="mm / hr"
          badge={isRaining ? "RAINING" : "DRY"}
          badgeBg={isRaining ? "rgba(45,212,191,0.15)" : "rgba(255,255,255,0.05)"}
          badgeColor={isRaining ? "var(--teal)" : "var(--text-muted)"}
        />
        <MetricCard delay={0.40}
          icon="⚡" iconBg="rgba(245,166,35,0.1)"
          label="Efficiency" value={`${efficiency}%`}
          badge={efficiency > 75 ? "EFFICIENT" : "IMPROVE"}
          badgeBg={efficiency > 75 ? "rgba(139, 92, 246, 0.15)" : "rgba(242,87,87,0.15)"}
          badgeColor={efficiency > 75 ? "var(--primary)" : "var(--red)"}
        />
      </div>

      {/* ── AI Insights + Controls ── */}
      <div className="section-title">AI Crop Intelligence</div>
      <div className="grid-3" style={{ marginBottom: 20 }}>
        <CropIntelligence 
          selectedCrop={selectedCrop}
          setSelectedCrop={setSelectedCrop}
          nextCrop={nextCrop}
          predictedYield={predictedYield}
          moisture={averageMoisture}
          temperature={temperature}
          isRaining={isRaining}
          fertilizer={fertilizer}
        />
      </div>

      {/* ── Soil Health + Control Panel ── */}
      <div className="grid-3" style={{ marginBottom: 20 }}>

        {/* Soil Health */}
        <div className="glass-card" style={{ animationDelay:"0.05s" }}>
          <div className="card-icon bg-primary">🌍</div>
          <div className="card-label">Soil Health Index</div>
          <SoilHealthRing score={soilHealth} />
          <div style={{ textAlign:"center", marginBottom:12 }}>
            <span className="card-badge"
              style={{ background: `${soilColor}22`, color: soilColor }}>
              {soilLabel}
            </span>
          </div>
          <div style={{ fontSize:"0.72rem", color:"var(--text-muted)", fontFamily:"var(--font-mono)", marginBottom:6 }}>
            SCORE BREAKDOWN
          </div>
          <ProgressBar value={Math.min(100,(averageMoisture/100)*100)} color="var(--blue)" />
          <div style={{ fontSize:"0.7rem", color:"var(--text-muted)", fontFamily:"var(--font-mono)", margin:"4px 0 8px" }}>Moisture · {averageMoisture}%</div>
          <ProgressBar value={Math.max(0, 100 - ((temperature - 15) / 30) * 100)} color="var(--amber)" />
          <div style={{ fontSize:"0.7rem", color:"var(--text-muted)", fontFamily:"var(--font-mono)", marginTop:4 }}>Temp Score · {Math.max(0,100-Math.round(((temperature-15)/30)*100))}%</div>
        </div>

        {/* Control Panel */}
        <ControlPanel 
          pumpActive={pumpActive}
          togglePump={togglePump}
          autoMode={autoMode}
          toggleAuto={toggleAuto}
        />

        {/* Weather Summary */}
        <WeatherSummary 
          temperature={temperature}
          humidity={humidity}
          isRaining={isRaining}
          rainMm={rainMm}
          moisture={averageMoisture}
        />
      </div>

      {/* ── Charts ── */}
      <div className="section-title">Analytics & Trends</div>
      <div className="grid-2" style={{ marginBottom: 20 }}>

        {/* Moisture Chart */}
        <ChartCard
          title="Dual Sensor Moisture History"
          sub="Real-time moisture levels · last 20 readings"
          delay={0.05}
        >
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={moistureHistory}>
              <defs>
                <linearGradient id="mg1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8B5CF6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="mg2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#C084FC" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#C084FC" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="time" tick={{ fontSize:9, fill:"#9333ea", fontFamily:"JetBrains Mono" }} interval="preserveStartEnd" />
              <YAxis domain={[0,100]} tick={{ fontSize:9, fill:"#9333ea", fontFamily:"JetBrains Mono" }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="sensor1" name="Sensor 1 %" stroke="#8B5CF6" strokeWidth={2} fill="url(#mg1)" dot={false} />
              <Area type="monotone" dataKey="sensor2" name="Sensor 2 %" stroke="#C084FC" strokeWidth={2} fill="url(#mg2)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Yield Chart */}
        <ChartCard
          title="Yield Prediction Trend"
          sub="Monthly predicted yield in kg/acre"
          delay={0.1}
        >
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={updatedYieldHistory}>
              <defs>
                <linearGradient id="yg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#2dd4bf" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fontSize:9, fill:"#9333ea", fontFamily:"JetBrains Mono" }} />
              <YAxis tick={{ fontSize:9, fill:"#9333ea", fontFamily:"JetBrains Mono" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="yield" name="Yield kg/ac" fill="url(#yg)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Water Usage Chart */}
        <ChartCard
          title="Water Usage Timeline"
          sub="Cumulative pump consumption · litres"
          delay={0.15}
        >
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={waterHistory}>
              <defs>
                <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="time" tick={{ fontSize:9, fill:"#9333ea", fontFamily:"JetBrains Mono" }} />
              <YAxis tick={{ fontSize:9, fill:"#9333ea", fontFamily:"JetBrains Mono" }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="usage" name="Usage (L)" stroke="#60a5fa" strokeWidth={2} fill="url(#wg)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Soil Health Chart */}
        <ChartCard
          title="Soil Health Trend"
          sub="Soil health score over time · 0–100"
          delay={0.2}
        >
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={soilHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fontSize:9, fill:"#9333ea", fontFamily:"JetBrains Mono" }} />
              <YAxis domain={[0,100]} tick={{ fontSize:9, fill:"#9333ea", fontFamily:"JetBrains Mono" }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="health" name="Health Score" stroke="#f5a623" strokeWidth={2.5} dot={{ r:3, fill:"#f5a623", strokeWidth:0 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Footer ── */}
      <div style={{
        textAlign:"center", paddingTop:16, paddingBottom:8,
        fontSize:"0.68rem", fontFamily:"var(--font-mono)", color:"var(--text-muted)"
      }}>
        AGRISMART · SMART IRRIGATION SYSTEM · BENGALURU, KA · DATA UPDATES EVERY 5 MIN
      </div>

    </div>
  );
}
