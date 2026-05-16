class ThingSpeakService {
  constructor() {
    this.listeners = new Set();
    this.state = {
      sensor1: 0,
      sensor2: 0,
      pumpActive: false,
      waterUsage: 0,
      isRaining: false
    };
    this.status = {
      isLoading: true,
      isError: false,
      isConnected: false
    };
    this.intervalId = null;
    this.autoMode = true;
    
    this.channelId = import.meta.env.VITE_THINGSPEAK_CHANNEL_ID;
    this.readKey = import.meta.env.VITE_THINGSPEAK_READ_API;
    this.writeKey = import.meta.env.VITE_THINGSPEAK_WRITE_API;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback({ data: this.state, status: this.status });
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb({ data: { ...this.state }, status: { ...this.status } }));
  }

  async fetchData() {
    if (!this.channelId || !this.readKey) {
      this.status = { isLoading: false, isError: true, isConnected: false };
      this.notify();
      console.error("ThingSpeak Configuration Missing");
      return;
    }

    try {
      this.status.isError = false;
      const response = await fetch(`https://api.thingspeak.com/channels/${this.channelId}/feeds.json?api_key=${this.readKey}&results=1`);
      
      if (!response.ok) throw new Error("Network response was not ok");
      
      const data = await response.json();
      const feeds = data.feeds;
      
      if (feeds && feeds.length > 0) {
        const latest = feeds[0];
        // Parse fields (adjust these based on your actual ESP32 code)
        // field1: Sensor 1, field2: Sensor 2, field3: Pump Status, field4: Water Usage, field5: Auto Mode
        if (latest.field1) this.state.sensor1 = parseFloat(latest.field1);
        if (latest.field2) this.state.sensor2 = parseFloat(latest.field2);
        if (latest.field3) this.state.pumpActive = latest.field3 === '1';
        if (latest.field4) this.state.waterUsage = parseFloat(latest.field4);
        if (latest.field5) this.autoMode = latest.field5 === '1';
        
        this.status.isConnected = true;
      }
    } catch (error) {
      console.error("ThingSpeak Fetch Error:", error);
      this.status.isError = true;
      this.status.isConnected = false;
    } finally {
      this.status.isLoading = false;
      this.notify();
    }
  }

  start() {
    if (this.intervalId) return;
    this.status.isLoading = true;
    this.fetchData(); // Initial fetch
    
    // Polling every 15 seconds as per ThingSpeak free tier limits
    this.intervalId = setInterval(() => {
      this.fetchData();
    }, 15000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async writeData(field, value) {
    if (!this.writeKey) return;
    
    // Note: Writing more than once every 15 seconds will be rate-limited by ThingSpeak
    try {
      const url = `https://api.thingspeak.com/update?api_key=${this.writeKey}&${field}=${value}`;
      await fetch(url, { method: 'GET', mode: 'no-cors' }); 
    } catch (error) {
      console.error("ThingSpeak Write Error:", error);
    }
  }

  setPumpActive(active) {
    // Optimistic update
    this.state.pumpActive = active;
    this.notify();
    this.writeData('field3', active ? '1' : '0');
  }

  setAutoMode(auto) {
    this.autoMode = auto;
    if (!auto) {
      this.state.pumpActive = false;
      this.writeData('field3', '0'); // Turn off pump when disabling auto
    }
    this.notify();
    this.writeData('field5', auto ? '1' : '0');
  }

  setIsRaining(raining) {
    this.state.isRaining = raining;
  }
}

export const thingspeakService = new ThingSpeakService();
