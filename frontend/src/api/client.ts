import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Attach the JWT (if we have one) to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the backend says the token is invalid/expired, log the user out
// so the UI drops back to the login screen instead of looping on 401s.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

/** Pulls a human-readable message out of an Axios error, with a safe fallback. */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string') return message;
  }
  return fallback;
}
