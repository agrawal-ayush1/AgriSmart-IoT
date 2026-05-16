# 🌾 AgriSmart: Smart Irrigation & AI Crop Intelligence

AgriSmart is a production-ready, futuristic IoT dashboard that integrates with ESP32 hardware to deliver real-time soil moisture tracking, predictive crop yield analysis, and automated water pump controls.

## 🏗 Architecture

The project follows a clean monorepo structure separating the web dashboard and hardware firmware.

```text
AgriSmart/
├── frontend/             # React + Vite Web Application
│   ├── src/
│   │   ├── components/   # Reusable UI elements (Glassmorphism)
│   │   ├── features/     # Dashboard, Control Panel, Intelligence
│   │   ├── services/     # Unified IoT API (ThingSpeak + Mock)
│   │   └── styles/       # Cyberpunk Purple Global CSS
│   ├── .env              # Vercel Environment Variables
│   └── package.json
│
├── esp32/                # C++ Arduino Firmware
│   ├── main.ino          # Hardware polling and HTTP logic
│   └── secrets.h         # Isolated WiFi & API credentials
│
└── .gitignore            # Security rules
```

## 🛠 Features

- **Futuristic Glassmorphism UI:** Neon purple accents with translucent glass cards.
- **Dual Sensor Live Tracking:** Visualizes moisture differentials across the field.
- **AI Crop Intelligence:** Predicts yield, soil health, and optimal fertilizer based on real-time data.
- **ThingSpeak IoT Integration:** Real-time bi-directional telemetry with ESP32.
- **Modular Adapter Pattern:** Seamlessly switch between Offline Mock Data and Live IoT Data.

## 🚀 Setup & Deployment

### 1. Frontend Setup (Local Development)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Configure your environment variables in `frontend/.env`:
   ```env
   VITE_USE_MOCK_DATA=false
   VITE_THINGSPEAK_CHANNEL_ID=your_channel_id
   VITE_THINGSPEAK_READ_API=your_read_api
   ```
   *(Note: Set `VITE_USE_MOCK_DATA=true` to test the UI without hardware).*
3. Run the development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Deployment (Vercel)
1. Push this repository to GitHub.
2. Import the project in Vercel.
3. **Important:** Set the **Root Directory** to `frontend` in your Vercel project settings.
4. Add the Environment Variables directly in the Vercel Dashboard.
5. Deploy!

### 3. ESP32 Hardware Setup
1. Open `esp32/main.ino` in the Arduino IDE.
2. Open `esp32/secrets.h` and enter your WiFi SSID, Password, and ThingSpeak Write API Key.
3. Wire your hardware:
   - Moisture Sensor 1: Pin 34
   - Moisture Sensor 2: Pin 35
   - Pump Relay: Pin 26
4. Select your ESP32 board and click **Upload**.

## 📸 Screenshots
*(Add your beautiful dashboard screenshots here once deployed!)*

## 🔮 Future Improvements
- Migration from ThingSpeak to Firebase Realtime Database for sub-second latency.
- Historical data export (CSV/PDF reports).
- Push notifications via SMS for critical low-moisture alerts.

---
**Built with React, Vite, and ❤️**
