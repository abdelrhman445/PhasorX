import { apiClient } from './client';
import type { AuthResponse } from '../types';

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/auth/login', { email, password });
  return res.data;
}

export async function registerRequest(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/auth/register', { name, email, password });
  return res.data;
}
