// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
  TIMEOUT: 10000, // 10 seconds
};

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Request Config
export interface RequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  requireAuth?: boolean;
}

// Auth Token Management
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

// Default Headers
export const getDefaultHeaders = (includeAuth = false): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Generic API Request Function
export const apiRequest = async <T = any>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> => {
  const {
    method = 'GET',
    headers = {},
    body,
    requireAuth = false,
  } = config;

  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const requestHeaders = {
    ...getDefaultHeaders(requireAuth),
    ...headers,
  };

  const requestConfig: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== 'GET') {
    requestConfig.body = JSON.stringify(body);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const response = await fetch(url, {
      ...requestConfig,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    // Return the response structure from backend as-is
    if (response.ok) {
      return {
        success: data.success !== false,
        message: data.message || 'Success',
        data: data.data || data,
      };
    } else {
      // Handle error responses without throwing
      return {
        success: false,
        message: data.message || `HTTP error! status: ${response.status}`,
        error: data.error || data.message || 'Request failed',
      };
    }

  } catch (error: any) {
    console.error('API Request Error:', error);
    
    return {
      success: false,
      message: 'Request failed',
      error: error.message || 'Network error occurred',
    };
  }
};

// API Status Check
export const checkApiStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api', '')}/health`);
    return response.ok;
  } catch {
    return false;
  }
};