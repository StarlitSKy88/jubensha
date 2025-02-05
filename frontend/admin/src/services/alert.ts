import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

export interface Alert {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: number;
}

export interface GetAlertsOptions {
  startTime?: number;
  endTime?: number;
  severity?: Alert['severity'];
  limit?: number;
}

export const alertService = {
  async getAlerts(options: GetAlertsOptions = {}): Promise<Alert[]> {
    const response = await axios.get(`${API_BASE_URL}/api/alerts`, {
      params: options,
    });
    return response.data;
  },
}; 