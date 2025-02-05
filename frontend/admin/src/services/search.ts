import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

export interface SystemStatus {
  elasticsearch: boolean;
  milvus: boolean;
  redis: boolean;
}

export const searchService = {
  async getSystemStatus(): Promise<SystemStatus> {
    const response = await axios.get(`${API_BASE_URL}/api/system/status`);
    return response.data;
  },
}; 