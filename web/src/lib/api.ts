export type Usuario = {
  idUsuario: number;
  idNivel_Usuario: number;
  nome: string;
  email: string;
  cpf: string | null;
  dataNasc: Date | null 
};

export type Area = {
  idArea: number;
  cidade: string;
  bairro: string;
  rua: string;
  statusArea: string;
  latitude: number | null;
  longitude: number | null;
  raio?: number | null;
  poligono?: string | [number, number][] | null;
};

export type Denuncia = {
  idDenuncias: number;
  idUsuario: number;
  idArea: number;
  titulo: string;
  dataDenuncia: string;
  statusDenuncia: string;
  descricao: string | null;
  foto: string | null;
  usuario?: Pick<Usuario, "idUsuario" | "nome">;
  area?: Pick<Area, "idArea" | "cidade" | "bairro" | "rua" | "latitude" | "longitude" | "raio" | "poligono" | "statusArea">;
};

export type Ong = {
  idOngs: number;
  idUsuario: number;
  regiao: string;
  cnpj: string;
  telefone: string;
  descricao: string;
  usuario?: Pick<Usuario, "idUsuario" | "nome" | "email">;
};

export type Projeto = {
  id_Projeto: number;
  idUsuario: number;
  objetivo: string;
  descricao: string;
  percentualConclusao: number;
};

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3333/api";

const TOKEN_KEY = "@verde:token";
const USER_KEY = "@verde:user";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

type StoredUser = { usuario: Usuario; tipo: "admin" | "comum" };

export function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(data: StoredUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(data));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, v);
    }
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* sem corpo */
  }

  if (!res.ok) {
    if (res.status === 401) {
      clearAuth();
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    const msg =
      data?.error ||
      (Array.isArray(data?.errors) && data.errors[0]?.message) ||
      `Erro ${res.status}`;
    throw new ApiError(msg, res.status);
  }

  return data as T;
}

export const api = {
  get: <T = any>(path: string, params?: Record<string, string>) =>
    request<T>("GET", path, undefined, params),
  post: <T = any>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T = any>(path: string, body?: unknown) => request<T>("PUT", path, body),
  del: <T = any>(path: string) => request<T>("DELETE", path),
};