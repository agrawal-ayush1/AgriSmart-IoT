export const CROPS = ["Rice", "Wheat", "Maize", "Pulses", "Sugarcane"];

export const ROTATION_MAP = {
  Rice: "Wheat",
  Wheat: "Pulses",
  Pulses: "Maize",
  Maize: "Rice",
  Sugarcane: "Wheat",
};

export const CROP_BASE_YIELD = {
  Rice: 2200,
  Wheat: 1800,
  Maize: 2600,
  Pulses: 1100,
  Sugarcane: 6000,
};

export const CROP_ICONS = {
  Rice: "🌾",
  Wheat: "🌿",
  Maize: "🌽",
  Pulses: "🫘",
  Sugarcane: "🎋",
};

export const FERT_INFO = {
  "Urea":            { icon: "🧪", desc: "High nitrogen — boosts leafy growth" },
  "DAP":             { icon: "⚗️", desc: "Phosphorus & nitrogen — root development" },
  "NPK":             { icon: "🔬", desc: "Balanced macro-nutrients blend" },
  "Organic Compost": { icon: "🌱", desc: "Improves soil texture & microbiota" },
};
