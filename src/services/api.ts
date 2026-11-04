export const API_BASE = '/api';

export const delay = (ms: number = 180): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  async get<T>(endpoint: string, fallbackFn: () => Promise<T> | T): Promise<T> {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data !== undefined ? json.data : json;
    } catch (err) {
      // Fallback to local storage persistence
      return fallbackFn();
    }
  },

  async post<T>(endpoint: string, body: any, fallbackFn: () => Promise<T> | T): Promise<T> {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data !== undefined ? json.data : json;
    } catch (err) {
      return fallbackFn();
    }
  },

  async put<T>(endpoint: string, body: any, fallbackFn: () => Promise<T> | T): Promise<T> {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data !== undefined ? json.data : json;
    } catch (err) {
      return fallbackFn();
    }
  },

  async delete<T>(endpoint: string, fallbackFn: () => Promise<T> | T): Promise<T> {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data !== undefined ? json.data : json;
    } catch (err) {
      return fallbackFn();
    }
  },
};
