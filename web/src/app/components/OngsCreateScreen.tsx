import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Phone,
  Send,
  Users,
} from "lucide-react";
import { api } from "../../lib/api";

function formatCnpj(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);

  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function formatTelefone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export function OngsCreateScreen() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [regiao, setRegiao] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [telefone, setTelefone] = useState("");
  const [descricao, setDescricao] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function resetForm() {
    setNome("");
    setRegiao("");
    setCnpj("");
    setTelefone("");
    setDescricao("");
    setError(null);
    setSubmitted(false);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (
      !nome.trim() ||
      !regiao.trim() ||
      !cnpj.trim() ||
      !telefone.trim() ||
      !descricao.trim()
    ) {
      setError(
        "Preencha o nome, a região, o CNPJ, o telefone e a descrição da ONG.",
      );
      return;
    }

    const cnpjDigits = cnpj.replace(/\D/g, "");
    const telefoneDigits = telefone.replace(/\D/g, "");

    if (cnpjDigits.length !== 14) {
      setError("Informe um CNPJ válido com 14 dígitos.");
      return;
    }

    if (telefoneDigits.length < 10 || telefoneDigits.length > 11) {
      setError("Informe um telefone válido.");
      return;
    }

    setBusy(true);

    try {
      await api.post("/ongs", {
        nome: nome.trim(),
        regiao: regiao.trim(),
        cnpj: cnpjDigits,
        telefone: telefoneDigits,
        descricao: descricao.trim(),
      });

      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível enviar a solicitação.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 bg-[var(--background)] px-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-3xl bg-success/10 text-success">
          <CheckCircle2 size={34} strokeWidth={1.6} />
        </div>

        <div>
          <p className="font-display text-xl font-semibold text-foreground">
            Solicitação enviada
          </p>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Sua solicitação de cadastro foi encaminhada para análise da
            administração.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate("/")}
            className="btn btn-primary text-sm font-semibold"
          >
            Voltar ao início
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[var(--background)]">
      <div className="border-b border-black/[0.06] px-4 pt-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Voltar
        </button>

        <p className="mb-1 font-display text-[13px] italic text-muted-foreground">
          Faça parte da rede
        </p>

        <h1 className="text-[1.35rem] text-foreground">Cadastrar ONG</h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4 px-4 py-4"
        >
          <div className="flex items-start gap-3 rounded-xl bg-primary/5 px-3.5 py-3">
            <Users size={18} className="mt-0.5 shrink-0 text-primary" />

            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Preencha os dados da organização. A solicitação será analisada
              pela administração antes da aprovação.
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-muted-foreground">
              Nome da ONG
            </span>

            <div className="flex items-center gap-2 rounded-xl border border-black/[0.07] bg-white px-3.5 py-3">
              <Users size={16} className="shrink-0 text-primary" />

              <input
                required
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Ex.: Instituto Verde"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-muted-foreground">
              Região de atuação
            </span>

            <div className="flex items-center gap-2 rounded-xl border border-black/[0.07] bg-white px-3.5 py-3">
              <MapPin size={16} className="shrink-0 text-primary" />

              <input
                required
                value={regiao}
                onChange={(event) => setRegiao(event.target.value)}
                placeholder="Ex.: Cidade Tiradentes"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-muted-foreground">
              CNPJ
            </span>

            <input
              required
              inputMode="numeric"
              value={cnpj}
              onChange={(event) => setCnpj(formatCnpj(event.target.value))}
              placeholder="00.000.000/0000-00"
              maxLength={18}
              className="w-full rounded-xl border border-black/[0.07] bg-white px-3.5 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-muted-foreground">
              Telefone
            </span>

            <div className="flex items-center gap-2 rounded-xl border border-black/[0.07] bg-white px-3.5 py-3">
              <Phone size={16} className="shrink-0 text-primary" />

              <input
                required
                inputMode="tel"
                value={telefone}
                onChange={(event) =>
                  setTelefone(formatTelefone(event.target.value))
                }
                placeholder="(11) 99999-9999"
                maxLength={15}
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-muted-foreground">
              Descrição
            </span>

            <textarea
              required
              rows={4}
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              placeholder="Descreva a ONG e seu trabalho..."
              className="w-full resize-none rounded-xl border border-black/[0.07] bg-white px-3.5 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
            />
          </label>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-error/25 bg-error/10 px-3.5 py-3 text-[13px] text-error">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className={`btn mt-1 w-full text-sm font-semibold ${
              busy ? "btn-disabled" : "btn-primary"
            }`}
          >
            {busy ? "Enviando…" : "Enviar solicitação"}
            {!busy && <Send size={15} />}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={busy}
            className="btn btn-ghost w-full text-sm text-muted-foreground"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}