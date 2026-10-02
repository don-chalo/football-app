import type { HttpClient } from "./http";
import type { LoginResponse } from "./types";

export interface Credenciales {
  username: string;
  password: string;
}

export interface AuthService {
  login: (c: Credenciales) => Promise<LoginResponse>;
}

export function createAuthService(http: HttpClient): AuthService {
  return {
    login: (c) => http.post<LoginResponse>("/auth/login", c),
  };
}
