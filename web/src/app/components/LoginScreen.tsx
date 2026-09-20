import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Leaf, LoaderCircle, Lock, Mail, TriangleAlert } from "lucide-react";
import { useAuth } from "../../lib/auth";

export function LoginScreen() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? "/";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signIn(email.trim(), senha);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full w-full items-center justify-center md:p-6">
      <div className="flex h-full w-full flex-col overflow-hidden bg-[var(--background)] md:h-[min(880px,calc(100dvh-48px))] md:max-w-[430px] md:rounded-[30px] md:shadow-[0_0_0_1px_rgba(255,255,255,0.07),0_40px_90px_rgba(0,0,0,0.55)]">
        <div className="relative flex-1 overflow-y-auto">
          <div className="bg-gradient-to-br from-secondary via-[#0E4C33] to-primary px-6 pb-24 pt-16">
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-white/12 text-white">
                <Leaf size={20} strokeWidth={2} />
              </div>
              <span className="font-display text-lg font-semibold text-white">+Verde</span>
            </div>
            <h1 className="mt-10 font-display text-[2rem] font-medium leading-[1.08] tracking-tight text-white">
              Cidade Tiradentes,
              <br />
              mais verde<span className="text-[#A7D7B8]">.</span>
            </h1>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
              Mapeie áreas sem arborização, denuncie e conecte-se com ONGs que reforestam a zona
              leste de São Paulo.
            </p>
          </div>

          <div className="mx-auto -mt-12 max-w-sm px-6 pb-10">
            <form onSubmit={onSubmit} className="rounded-3xl border border-black/[0.06] bg-white p-5 shadow-[0_10px_40px_rgba(12,51,34,0.18)]">
              <p className="mb-4 text-sm font-semibold text-foreground">Entrar na sua conta</p>

              <label className="form-control mb-3">
                <span className="mb-1.5 text-xs font-semibold text-muted-foreground">E-mail</span>
                <div className="relative">
                  <Mail size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@email.com"
                    className="input w-full border-black/10 bg-base-200/60 pl-10 text-sm text-foreground focus-within:border-primary"
                  />
                </div>
              </label>

              <label className="form-control mb-1">
                <span className="mb-1.5 text-xs font-semibold text-muted-foreground">Senha</span>
                <div className="relative">
                  <Lock size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="input w-full border-black/10 bg-base-200/60 pl-10 text-sm text-foreground focus-within:border-primary"
                  />
                </div>
              </label>

              {error && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-error/25 bg-error/10 px-3 py-2.5 text-[13px] leading-snug text-error">
                  <TriangleAlert size={15} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="btn btn-primary mt-4 w-full text-sm font-semibold disabled:opacity-60"
              >
                {busy ? <LoaderCircle size={16} className="animate-spin" /> : null}
                Entrar
              </button>

              <p className="mt-4 text-center text-[13px] text-muted-foreground">
                Ainda não tem conta?{" "}
                <Link to="/cadastro" className="font-semibold text-primary hover:underline">
                  Cadastre-se
                </Link>
              </p>
            </form>

            <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
              Rede comunitária de arborização urbana de{" "}
              <span className="text-foreground">Cidade Tiradentes</span> — concebida em parceria com
              ONGs e moradores da região.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}