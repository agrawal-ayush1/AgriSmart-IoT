export const DashboardHeader = ({ pumpActive, autoMode, weatherLoading, isConnected, isLoading, isError }) => {
  const isMock = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
  
  let connectionText = "DISCONNECTED";
  let dotColor = "var(--red)";
  
  if (isLoading) {
    connectionText = "CONNECTING...";
    dotColor = "var(--amber)";
  } else if (isError) {
    connectionText = "API ERROR";
    dotColor = "var(--red)";
  } else if (isConnected) {
    connectionText = isMock ? "MOCK LIVE" : "IOT CONNECTED";
    dotColor = "var(--primary)";
  }

  return (
    <div className="header">
      <div className="header-left">
        <div className="logo-ring">🌾</div>
        <div>
          <div className="header-title">AgriSmart</div>
          <div className="header-sub">Smart Irrigation & AI Crop Intelligence</div>
        </div>
      </div>
      <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
        <div className="status-pill">
          <div className="dot" style={{ background: pumpActive ? "var(--primary)" : "var(--text-muted)" }} />
          PUMP {pumpActive ? "ACTIVE" : "IDLE"}
        </div>
        <div className="status-pill">
          <div className="dot" style={{ background: autoMode ? "var(--teal)" : "var(--amber)" }} />
          {autoMode ? "AUTO MODE" : "MANUAL MODE"}
        </div>
        <div className="status-pill" style={{ border: isError ? "1px solid rgba(242,87,87,0.3)" : undefined }}>
          <div className="dot" style={{ background: dotColor }} />
          {connectionText}
        </div>
      </div>
    </div>
  );
};
