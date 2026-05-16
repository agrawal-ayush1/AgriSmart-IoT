class MockSensorService {
  constructor() {
    this.listeners = new Set();
    this.state = {
      sensor1: 58,
      sensor2: 60,
      pumpActive: false,
      waterUsage: 0,
      isRaining: false
    };
    this.status = {
      isLoading: false,
      isError: false,
      isConnected: true
    };
    this.intervalId = null;
    this.autoMode = true;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback({ data: this.state, status: this.status });
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb({ data: { ...this.state }, status: { ...this.status } }));
  }

  start() {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      let s1 = this.state.sensor1;
      let s2 = this.state.sensor2;

      // Auto mode logic
      if (this.autoMode) {
        const avg = (s1 + s2) / 2;
        if (avg < 35 && !this.state.isRaining) {
          this.state.pumpActive = true;
        } else if (avg >= 70 || this.state.isRaining) {
          this.state.pumpActive = false;
        }
      }

      // Simulate physics
      if (this.state.pumpActive) {
        s1 = Math.min(100, s1 + 1.5 + (Math.random() * 0.5));
        s2 = Math.min(100, s2 + 1.2 + (Math.random() * 0.5));
        this.state.waterUsage += 2.3;
      } else if (this.state.isRaining) {
        s1 = Math.min(100, s1 + 0.8);
        s2 = Math.min(100, s2 + 0.9);
      } else {
        s1 = Math.max(0, s1 - 0.6 - (Math.random() * 0.2));
        s2 = Math.max(0, s2 - 0.5 - (Math.random() * 0.2));
      }

      this.state.sensor1 = parseFloat(s1.toFixed(1));
      this.state.sensor2 = parseFloat(s2.toFixed(1));
      
      this.notify();
    }, 2000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  setPumpActive(active) {
    this.state.pumpActive = active;
    this.notify();
  }

  setAutoMode(auto) {
    this.autoMode = auto;
    if (!auto) this.state.pumpActive = false;
    this.notify();
  }

  setIsRaining(raining) {
    this.state.isRaining = raining;
  }
}

export const mockSensorService = new MockSensorService();
