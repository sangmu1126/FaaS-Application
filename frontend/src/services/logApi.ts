import { apiClient } from './api';
import type { LogEntry } from '../types/function';

interface LogFilters {
  functionId?: string;
  level?: 'info' | 'warning' | 'error';
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

interface LogResponse {
  logs: LogEntry[];
  total: number;
  hasMore: boolean;
}

export const logApi = {
  // Get logs with filters
  getLogs: async (filters?: LogFilters): Promise<LogResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.functionId) params.append('functionId', filters.functionId);
    if (filters?.level) params.append('level', filters.level);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/logs?${queryString}` : '/logs';
    
    return apiClient.get<LogResponse>(endpoint);
  },

  // Get logs for specific function
  getFunctionLogs: async (
    functionId: string,
    limit = 50
  ): Promise<LogEntry[]> => {
    return apiClient.get<LogEntry[]>(
      `/functions/${functionId}/logs?limit=${limit}`
    );
  },

  // Get single log entry
  getLog: async (id: string): Promise<LogEntry> => {
    return apiClient.get<LogEntry>(`/logs/${id}`);
  },

  // Clear logs for function
  clearFunctionLogs: async (functionId: string): Promise<void> => {
    return apiClient.delete<void>(`/functions/${functionId}/logs`);
  },
};
