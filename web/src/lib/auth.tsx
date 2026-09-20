import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  api,
  clearAuth,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
  type Usuario,
} from "./api";

type Tipo = "admin" | "comum";

type AuthContextValue = {
  user: Usuario | null;
  tipo: Tipo | null;
  loading: boolean;
  signIn: (email: string, senha: string) => Promise<void>;
  signUp: (data: {
    nome: string;
    email: string;
    senha: string;
    cpf?: string;
    dataNasc?: string;
  }) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [tipo, setTipo] = useState<Tipo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const stored = getStoredUser();
      if (!stored || !getToken()) {
        if (mounted) setLoading(false);
        return;
      }
      try {
        const { usuario } = await api.get<{ usuario: Usuario }>("/usuarios/profile");
        if (!mounted) return;
        setUser(usuario);
        setTipo(stored.tipo);
        setStoredUser({ usuario, tipo: stored.tipo });
      } catch {
        if (!mounted) return;
        clearAuth();
        setUser(null);
        setTipo(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    bootstrap();

    const onUnauthorized = () => {
      setUser(null);
      setTipo(null);
    };
    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () => {
      mounted = false;
      window.removeEventListener("auth:unauthorized", onUnauthorized);
    };
  }, []);

  const signIn = useCallback(async (email: string, senha: string) => {
    const data = await api.post<{
      usuario: Usuario;
      tipo: Tipo;
      token: string;
    }>("/auth/login", { email, senha });
    setToken(data.token);
    setStoredUser({ usuario: data.usuario, tipo: data.tipo });
    setUser(data.usuario);
    setTipo(data.tipo);
  }, []);

  const signUp = useCallback(
    async (data: { nome: string; email: string; senha: string; cpf?: string; dataNasc?: string }) => {
      const body: Record<string, string> = {
        nome: data.nome,
        email: data.email,
        senha: data.senha,
      };
      if (data.cpf) body.cpf = data.cpf;
      if (data.dataNasc) body.dataNasc = data.dataNasc;

      const res = await api.post<{ usuario: Usuario; token: string }>("/auth/register", body);
      setToken(res.token);
      setStoredUser({ usuario: res.usuario, tipo: "comum" });
      setUser(res.usuario);
      setTipo("comum");
    },
    [],
  );

  const signOut = useCallback(() => {
    clearAuth();
    setUser(null);
    setTipo(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, tipo, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}