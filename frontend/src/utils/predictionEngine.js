import { CROP_BASE_YIELD } from "../constants/config";

export const PredictionEngine = {
  calculateYield(crop, moisture, temperature, isRaining, waterUsage) {
    let base = CROP_BASE_YIELD[crop] || 2000;
    let multiplier = 1.0;
    if (moisture < 30) multiplier -= 0.25;
    else if (moisture >= 60) multiplier += 0.1;
    if (temperature > 35) multiplier -= 0.2;
    else if (temperature >= 25 && temperature <= 30) multiplier += 0.1;
    if (isRaining) multiplier += 0.15;
    if (waterUsage > 800) multiplier -= 0.1;
    else if (waterUsage < 300) multiplier -= 0.05;
    return Math.round(base * Math.max(0.3, Math.min(1.5, multiplier)));
  },

  getFertilizer(crop, moisture, temperature) {
    if (moisture < 30) return "Organic Compost";
    if (temperature > 35) return "DAP";
    if (["Rice", "Maize", "Sugarcane"].includes(crop)) return "Urea";
    if (["Wheat", "Pulses"].includes(crop)) return "NPK";
    return "NPK";
  },

  getSoilHealth(moisture, temperature, waterUsage) {
    let score = 100;
    if (moisture < 20) score -= 30;
    else if (moisture < 40) score -= 15;
    else if (moisture > 80) score -= 20;
    if (temperature > 38) score -= 20;
    else if (temperature > 33) score -= 10;
    if (waterUsage > 900) score -= 15;
    else if (waterUsage < 200) score -= 10;
    return Math.max(0, Math.min(100, score));
  },
};
