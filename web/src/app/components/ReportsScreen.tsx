import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocation } from "react-router";
import { AlertTriangle, CheckCircle2, MapPin, Scissors, TreePine, TriangleAlert, XCircle } from "lucide-react";
import { api, type Area, type Denuncia } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { useFetch } from "../../lib/use-fetch";
import { Card, DataError, EmptyState, Loading, StatusBadge, num } from "./ui";

const categories = [
  { key: "sem-arvores", label: "Local sem árvores", Icon: TreePine },
  { key: "corte-irregular", label: "Corte irregular", Icon: XCircle },
  { key: "poda-inadequada", label: "Poda inadequada", Icon: Scissors },
  { key: "area-degradada", label: "Área degradada", Icon: TriangleAlert },
] as const;

type CatKey = (typeof categories)[number]["key"];

const DEN_STATUS = {
  aberta: { label: "Aberta", join: "badge-error" },
  "em tratamento": { label: "Em tratamento", join: "badge-warning" },
  resolvido: { label: "Resolvida", join: "badge-success" },
};

function parseAddress(raw: string) {
  const [first, ...rest] = raw.split(",").map((s) => s.trim());
  return {
    rua: first || "Área não nomeada",
    bairro: rest.join(" ").trim() || undefined,
  };
}

export function ReportsScreen() {
  const { user } = useAuth();
  const location = useLocation();
  const [tab, setTab] = useState<"nova" | "minhas">("nova");

  useEffect(() => {
    const state = location.state as { address?: string } | null;
    if (state?.address && !address) setAddress(state.address);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const [category, setCategory] = useState<CatKey | "">("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [foto, setFoto] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [protocol, setProtocol] = useState<number | null>(null);

  const areas = useFetch<Area[]>(() => api.get("/areas").then((r) => r.areas));
  const denuncias = useFetch<Denuncia[]>(() => api.get("/denuncias", { idUsuario: String(user?.idUsuario ?? "") }).then((r) => r.denuncias).catch(() => []), [user?.idUsuario]);

  const myReports = useMemo(
    () => (denuncias.data ?? []).filter((d) => d.usuario?.idUsuario === user?.idUsuario),
    [denuncias.data, user?.idUsuario],
  );

  const canSubmit = !!category && address.trim().length > 0 && !busy;

  const reset = () => {
    setCategory("");
    setAddress("");
    setDescription("");
    setFoto("");
    setProtocol(null);
    setError(null);
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!category || !address.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const { rua, bairro } = parseAddress(address);
      let area = (areas.data ?? []).find(
        (a) => a.rua.toLowerCase().includes(rua.toLowerCase()),
      );
      if (!area) {
        const created = await api.post<{ area: Area }>("/areas", {
          cidade: "Cidade Tiradentes",
          bairro: bairro ?? "Cidade Tiradentes",
          rua,
          statusArea: "identificada",
        });
        area = created.area;
        areas.reload();
      }

      const label = categories.find((c) => c.key === category)?.label ?? "Denúncia";
      const res = await api.post<{ denuncia: Denuncia }>("/denuncias", {
        idArea: area.idArea,
        titulo: label,
        descricao: description.trim() || undefined,
        foto: foto.trim() || undefined,
      });
      setProtocol(res.denuncia.idDenuncias);
      denuncias.reload();
      setTab("nova");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível enviar a denúncia.");
    } finally {
      setBusy(false);
    }
  }

  if (protocol !== null && tab === "nova") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 px-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-3xl bg-success/10 text-success">
          <CheckCircle2 size={34} strokeWidth={1.6} />
        </div>
        <div>
          <p className="font-display text-xl font-semibold text-foreground">Denúncia registrada</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Protocolo{" "}
            <span className="font-semibold text-foreground">#{protocol}</span> encaminhado às ONGs
            parceiras da região.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={reset} className="btn btn-primary text-sm font-semibold">
            Nova denúncia
          </button>
          <button onClick={() => setTab("minhas")} className="btn btn-ghost text-sm text-foreground">
            Ver minhas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[var(--background)]">
      {/* Header */}
      <div className="border-b border-black/[0.06] px-4 pt-4">
        <p className="mb-1 font-display text-[13px] italic text-muted-foreground">Área sem arborização?</p>
        <h1 className="text-[1.35rem] text-foreground">Denúncias</h1>
        <div className="mt-3 flex">
          {[["nova", "Nova"], ["minhas", "Minhas"]].map(([k, lbl]) => (
            <button
              key={k}
              onClick={() => { setTab(k as typeof tab); setError(null); }}
              className={`flex-1 border-b-2 pb-3 text-sm transition-colors ${
                tab === k
                  ? "border-primary font-semibold text-foreground"
                  : "border-transparent font-medium text-muted-foreground"
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === "nova" ? (
          <form onSubmit={onSubmit} className="flex flex-col gap-4 px-4 py-4">
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              A denúncia é encaminhada diretamente para as ONGs parceiras que atuam em Cidade
              Tiradentes.
            </p>

            {/* Categoria */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-muted-foreground">Tipo de ocorrência</label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCategory(c.key)}
                    className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left text-[13px] font-medium transition-colors ${
                      category === c.key
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-black/[0.07] bg-white text-foreground"
                    }`}
                  >
                    <c.Icon size={17} strokeWidth={1.9} />
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Endereço */}
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-muted-foreground">Rua (bairro opcional)</span>
              <div className="flex items-center gap-2 rounded-xl border border-black/[0.07] bg-white px-3.5 py-3">
                <MapPin size={16} className="shrink-0 text-primary" />
                <input
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex.: Rua Iguaçu, 340 — Santa Etelvina"
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
                />
              </div>
            </label>

            {/* Descrição */}
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-muted-foreground">
                Descrição <span className="font-normal text-muted-foreground/70">(opcional)</span>
              </span>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva a situação…"
                className="w-full resize-none rounded-xl border border-black/[0.07] bg-white px-3.5 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
              />
            </label>

            {/* Foto URL */}
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-muted-foreground">
                Foto (URL) <span className="font-normal text-muted-foreground/70">(opcional)</span>
              </span>
              <input
                type="url"
                value={foto}
                onChange={(e) => setFoto(e.target.value)}
                placeholder="https://…"
                className="w-full rounded-xl border border-black/[0.07] bg-white px-3.5 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
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
              disabled={!canSubmit}
              className={`btn mt-1 w-full text-sm font-semibold ${
                canSubmit ? "btn-primary" : "btn-disabled"
              }`}
            >
              {busy ? "Enviando…" : "Enviar denúncia"}
            </button>
          </form>
        ) : (
          <div className="px-4 py-4">
            {denuncias.loading ? (
              <Loading label="Carregando suas denúncias…" />
            ) : denuncias.error ? (
              <DataError error={denuncias.error} onRetry={denuncias.reload} />
            ) : myReports.length === 0 ? (
              <EmptyState
                title="Nenhuma denúncia ainda"
                hint="Suas denúncias vão aparecer aqui com o status de andamento."
              />
            ) : (
              <>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {num(myReports.length)} {myReports.length === 1 ? "denúncia" : "denúncias"}
                </p>
                <div className="flex flex-col gap-2">
                  {myReports.map((r) => (
                    <Card key={r.idDenuncias} className="flex items-center justify-between gap-3 px-4 py-3.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{r.titulo}</p>
                        <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                          <MapPin size={11} className="shrink-0 text-primary" />
                          {r.area?.rua || r.area?.bairro || "Cidade Tiradentes"} · {r.dataDenuncia}
                        </p>
                      </div>
                      <StatusBadge status={r.statusDenuncia} map={DEN_STATUS} />
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}