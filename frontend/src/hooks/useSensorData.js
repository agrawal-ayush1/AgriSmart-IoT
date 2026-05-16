import { useState, useEffect, useCallback } from "react";
import { sensorService } from "../services/sensorService";

export function useSensorData() {
  const [data, setData] = useState(sensorService.state || {});
  const [status, setStatus] = useState(sensorService.status || { isLoading: true, isError: false, isConnected: false });
  const [autoMode, setAutoMode] = useState(sensorService.autoMode ?? true);

  useEffect(() => {
    const unsubscribe = sensorService.subscribe((payload) => {
      setData(payload.data);
      setStatus(payload.status);
    });
    sensorService.start();
    return () => {
      unsubscribe();
    };
  }, []);

  const togglePump = useCallback(() => {
    sensorService.setPumpActive(!data.pumpActive);
    if (autoMode) {
      setAutoMode(false);
      sensorService.setAutoMode(false);
    }
  }, [data.pumpActive, autoMode]);

  const toggleAuto = useCallback(() => {
    const newMode = !autoMode;
    setAutoMode(newMode);
    sensorService.setAutoMode(newMode);
  }, [autoMode]);

  const setIsRaining = useCallback((raining) => {
    sensorService.setIsRaining(raining);
  }, []);

  return {
    ...data,
    ...status,
    autoMode,
    togglePump,
    toggleAuto,
    setIsRaining
  };
}
