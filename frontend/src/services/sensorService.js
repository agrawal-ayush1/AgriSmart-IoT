import { mockSensorService } from "./mockSensorService";
import { thingspeakService } from "./thingspeakService";

const useMock = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

export const sensorService = useMock ? mockSensorService : thingspeakService;
