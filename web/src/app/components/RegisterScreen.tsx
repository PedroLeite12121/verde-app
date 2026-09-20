import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Leaf, LoaderCircle, TriangleAlert } from "lucide-react";
import { useAuth } from "../../lib/auth";

export function RegisterScreen() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ nome: "", email: "", senha: "", cpf: "", dataNasc: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signUp({
        nome: form.nome.trim(),
        email: form.email.trim(),
        senha: form.senha,
        cpf: form.cpf.trim() || undefined,
        dataNasc: form.dataNasc || undefined,
      });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar a conta.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full w-full items-center justify-center md:p-6">
      <div className="flex h-full w-full flex-col overflow-hidden bg-[var(--background)] md:h-[min(880px,calc(100dvh-48px))] md:max-w-[430px] md:rounded-[30px] md:shadow-[0_0_0_1px_rgba(255,255,255,0.07),0_40px_90px_rgba(0,0,0,0.55)]">
        <div className="relative flex-1 overflow-y-auto">
          <div className="px-6 pb-8 pt-6">
            <Link
              to="/login"
              className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={15} /> Voltar
            </Link>

            <div className="mb-6 flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-white">
                <Leaf size={17} strokeWidth={2} />
              </div>
              <span className="font-display text-base font-semibold text-foreground">+Verde</span>
            </div>

            <h1 className="font-display text-[1.7rem] font-medium leading-tight tracking-tight text-foreground">
              Faça parte da rede.
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Crie sua conta para denunciar áreas sem arborização e acompanhar projetos das ONGs
              parceiras.
            </p>
          </div>

          <div className="mx-auto max-w-sm px-6 pb-10">
            <form onSubmit={onSubmit} className="rounded-3xl border border-black/[0.06] bg-white p-5 shadow-[0_10px_30px_rgba(12,51,34,0.08)]">
              <label className="form-control mb-3">
                <span className="mb-1.5 text-xs font-semibold text-muted-foreground">Nome completo</span>
                <input
                  required
                  minLength={2}
                  value={form.nome}
                  onChange={set("nome")}
                  placeholder="Maria Rodrigues"
                  className="input w-full border-black/10 bg-base-200/60 text-sm text-foreground focus-within:border-primary"
                />
              </label>

              <label className="form-control mb-3">
                <span className="mb-1.5 text-xs font-semibold text-muted-foreground">E-mail</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="voce@email.com"
                  className="input w-full border-black/10 bg-base-200/60 text-sm text-foreground focus-within:border-primary"
                />
              </label>

              <label className="form-control mb-3">
                <span className="mb-1.5 text-xs font-semibold text-muted-foreground">Senha</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={form.senha}
                  onChange={set("senha")}
                  placeholder="Mínimo 6 caracteres"
                  className="input w-full border-black/10 bg-base-200/60 text-sm text-foreground focus-within:border-primary"
                />
              </label>

              <div className="mb-3 grid grid-cols-2 gap-3">
                <label className="form-control">
                  <span className="mb-1.5 text-xs font-semibold text-muted-foreground">CPF</span>
                  <input
                    inputMode="numeric"
                    value={form.cpf}
                    onChange={set("cpf")}
                    placeholder="Opcional"
                    className="input w-full border-black/10 bg-base-200/60 text-sm text-foreground focus-within:border-primary"
                  />
                </label>
                <label className="form-control">
                  <span className="mb-1.5 text-xs font-semibold text-muted-foreground">Nascimento</span>
                  <input
                    type="date"
                    value={form.dataNasc}
                    onChange={set("dataNasc")}
                    className="input w-full border-black/10 bg-base-200/60 text-sm text-foreground focus-within:border-primary"
                  />
                </label>
              </div>

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
                Criar conta
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}