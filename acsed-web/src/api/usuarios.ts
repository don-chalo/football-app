import type { HttpClient } from "./http";
import type { PublicUser, Role } from "./types";

export interface NuevoUsuario {
  username: string;
  password: string;
  role: Role;
}

export interface UsuariosService {
  listar: () => Promise<PublicUser[]>;
  crear: (input: NuevoUsuario) => Promise<PublicUser>;
}

export function createUsuariosService(http: HttpClient): UsuariosService {
  return {
    listar: () => http.get<PublicUser[]>("/usuarios"),
    crear: (input) => http.post<PublicUser>("/usuarios", input),
  };
}
