import { apiClient } from "../api-client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: { nickname: string; accessToken: string } | null;
}

export async function login(body: LoginRequest) {
  const response = await apiClient.post("auth/login", { json: body, retry: 0 }).json<LoginResponse>();
  if (!response.isSuccess || !response.result?.accessToken) {
    throw new Error(response.message);
  }
  return { ...response, result: response.result };
}
