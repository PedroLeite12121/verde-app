import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  MapPin,
  Sprout,
  TreePine,
  Users,
} from "lucide-react";
import { api, type Area, type Denuncia, type Ong, type Projeto } from "../../lib/api";
import { useFetch } from "../../lib/use-fetch";
import { Card, Loading, StatusBadge, num } from "./ui";

type Stats = {
  totalUsuarios: number;
  totalAdmins: number;
  totalComuns: number;
  totalAreas: number;
  totalONGs: number;
  totalProjetos: number;
  totalDenuncias: number;
  denunciasAbertas: number;
};

const DEN_STATUS = {
  aberta: { label: "Aberta", join: "badge-error" },
  "em tratamento": { label: "Em tratamento", join: "badge-warning" },
  resolvido: { label: "Resolvida", join: "badge-success" },
};

const AREA_STATUS = {
  identificada: { label: "Identificada", join: "badge-error" },
  "em tratamento": { label: "Em tratamento", join: "badge-warning" },
  reflorestada: { label: "Reflorestada", join: "badge-success" },
};

type Tab = "denuncias" | "areas" | "visao";

export function AdminScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("denuncias");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [updating, setUpdating] = useState(false);

  const dashboard = useFetch<Stats>(() => api.get("/admin/dashboard").then((r) => r.stats));
  const denuncias = useFetch<Denuncia[]>(() => api.get("/admin/denuncias").then((r) => r.denuncias));
  const areas = useFetch<Area[]>(() => api.get("/admin/areas").then((r) => r.areas));
  const ongs = useFetch<Ong[]>(() => api.get("/admin/ongs").then((r) => r.ongs));
  const projetos = useFetch<Projeto[]>(() => api.get("/admin/projetos").then((r) => r.projetos));

  const selected = useMemo(
    () => (denuncias.data ?? []).find((d) => d.idDenuncias === selectedId) ?? null,
    [denuncias.data, selectedId],
  );

  const deficitAreas = useMemo(
    () => (areas.data ?? []).filter((a) => a.statusArea !== "reflorestada"),
    [areas.data],
  );

  async function updateStatus(id: number, status: string) {
    setUpdating(true);
    try {
      await api.put(`/denuncias/${id}`, { statusDenuncia: status });
      setSelectedId(null);
      denuncias.reload();
      dashboard.reload();
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="flex h-full w-full items-center justify-center md:p-6">
      <div className="flex h-full w-full flex-col overflow-hidden bg-[var(--background)] md:h-[min(880px,calc(100dvh-48px))] md:max-w-[430px] md:rounded-[30px] md:shadow-[0_0_0_1px_rgba(255,255,255,0.07),0_40px_90px_rgba(0,0,0,0.55)]">
        {/* Header */}
        <div className="bg-gradient-to-br from-secondary via-[#0E4C33] to-primary px-5 pb-5 pt-5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/75 hover:text-white"
            >
              <ArrowLeft size={15} /> App
            </button>
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">
                +Verde · Painel da ONG
              </p>
              <h1 className="font-display text-lg font-semibold text-white">Dashboard</h1>
            </div>
          </div>

          {dashboard.loading ? (
            <div className="mt-4 h-14 animate-pulse rounded-2xl bg-white/15" />
          ) : dashboard.data ? (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { v: dashboard.data.denunciasAbertas, l: "Abertas", c: "text-[#F3B27A]" },
                { v: dashboard.data.totalDenuncias, l: "Denúncias", c: "text-[#B8E6C9]" },
                { v: dashboard.data.totalONGs, l: "ONGs", c: "text-[#F7D9A0]" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl bg-white/12 px-2 py-2.5 text-center">
                  <p className={`font-display text-2xl font-semibold ${s.c}`}>{num(s.v)}</p>
                  <p className="mt-0.5 text-[10px] font-semibold text-white/60">{s.l}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-black/[0.06] bg-[var(--background)]">
          {[["denuncias", "Denúncias"], ["areas", "Áreas"], ["visao", "Visão geral"]].map(([k, l]) => (
            <button
              key={k}
              onClick={() => { setTab(k as Tab); setSelectedId(null); }}
              className={`flex-1 border-b-2 py-2.5 text-xs font-semibold transition-colors ${
                tab === k
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loadingBucket(tab, { denuncias, areas, ongs, projetos, dashboard }) ? (
            <Loading label="Carregando…" />
          ) : tab === "denuncias" ? (
            selected ? (
              <div className="flex flex-col gap-3 px-4 py-4">
                <button
                  onClick={() => setSelectedId(null)}
                  className="inline-flex items-center gap-1.5 self-start text-[13px] font-semibold text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft size={14} /> Voltar
                </button>
                <Card className="p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{selected!.titulo}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin size={11} className="text-primary" />
                        {selected!.area?.rua || selected!.area?.bairro || "Cidade Tiradentes"}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {selected!.usuario?.nome} · {selected!.dataDenuncia}
                      </p>
                    </div>
                    <StatusBadge status={selected!.statusDenuncia} map={DEN_STATUS} />
                  </div>
                  {selected!.descricao && (
                    <div className="mb-4 rounded-xl bg-base-200/50 px-3.5 py-3 text-[13px] leading-relaxed text-foreground">
                      {selected!.descricao}
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <button
                      disabled={updating || selected!.statusDenuncia === "em tratamento"}
                      onClick={() => updateStatus(selected!.idDenuncias, "em tratamento")}
                      className="btn btn-warning w-full text-sm font-semibold disabled:opacity-50"
                    >
                      <Clock3 size={15} /> Marcar em tratamento
                    </button>
                    <button
                      disabled={updating || selected!.statusDenuncia === "resolvido"}
                      onClick={() => updateStatus(selected!.idDenuncias, "resolvido")}
                      className="btn btn-success w-full text-sm font-semibold disabled:opacity-50"
                    >
                      <CheckCircle2 size={15} /> Marcar resolvida
                    </button>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col gap-2 px-4 py-4">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {num(denuncias.data?.length)} denúncias registradas
                </p>
                {(denuncias.data ?? []).map((d) => (
                  <button
                    key={d.idDenuncias}
                    onClick={() => setSelectedId(d.idDenuncias)}
                    className="text-left"
                  >
                    <Card className="flex items-center gap-3 px-4 py-3.5">
                      <span
                        className={`size-2 shrink-0 rounded-full ${
                          d.statusDenuncia === "aberta"
                            ? "bg-error"
                            : d.statusDenuncia === "em tratamento"
                              ? "bg-warning"
                              : "bg-success"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{d.titulo}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {d.usuario?.nome} · {d.area?.rua || d.area?.bairro || "—"} · {d.dataDenuncia}
                        </p>
                      </div>
                      <StatusBadge status={d.statusDenuncia} map={DEN_STATUS} />
                    </Card>
                  </button>
                ))}
              </div>
            )
          ) : tab === "areas" ? (
            <div className="flex flex-col gap-2 px-4 py-4">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {num(areas.data?.length)} áreas mapeadas
              </p>
              {(areas.data ?? []).map((a) => (
                <Card key={a.idArea} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <TreePine size={16} strokeWidth={1.9} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {a.rua || a.bairro || a.cidade}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                      <MapPin size={11} className="text-primary" />
                      {a.bairro || a.cidade || "Cidade Tiradentes"}
                    </p>
                  </div>
                  <StatusBadge status={a.statusArea} map={AREA_STATUS} />
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4 px-4 py-4">
              {dashboard.data && (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { l: "Usuários", v: dashboard.data.totalUsuarios, Icon: Users, tone: "text-info bg-info/10" },
                    { l: "Áreas", v: dashboard.data.totalAreas, Icon: TreePine, tone: "text-primary bg-primary/10" },
                    { l: "Denúncias", v: dashboard.data.totalDenuncias, Icon: AlertTriangle, tone: "text-error bg-error/10" },
                    { l: "Projetos", v: dashboard.data.totalProjetos, Icon: Sprout, tone: "text-success bg-success/10" },
                  ].map((s) => (
                    <div key={s.l} className={`flex items-center gap-3 rounded-2xl ${s.tone.split(" ")[1]} p-3.5`}>
                      <s.Icon size={17} strokeWidth={1.9} className={s.tone.split(" ")[0]} />
                      <div>
                        <p className="font-display text-xl font-semibold leading-none text-foreground">{num(s.v)}</p>
                        <p className="mt-1 text-[11px] font-medium text-muted-foreground">{s.l}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Card className="p-4">
                <p className="text-sm font-semibold text-foreground">Áreas com déficit de arborização</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {num(deficitAreas.length)} áreas ainda precisam de intervenção
                </p>
                <div className="mt-3 flex flex-col">
                  {deficitAreas.slice(0, 5).map((a, i) => (
                    <div
                      key={a.idArea}
                      className={`flex items-center justify-between gap-2 py-2.5 ${
                        i > 0 ? "border-t border-black/[0.05]" : ""
                      }`}
                    >
                      <p className="truncate text-[13px] font-medium text-foreground">
                        {a.rua || a.bairro || a.cidade}
                      </p>
                      <StatusBadge status={a.statusArea} map={AREA_STATUS} />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <p className="text-sm font-semibold text-foreground">
                  ONGs ativas · {num(ongs.data?.length)}
                </p>
                <div className="mt-2 flex flex-col gap-1.5">
                  {(ongs.data ?? []).map((o) => (
                    <p key={o.idOngs} className="text-[13px] text-muted-foreground">
                      {o.usuario?.nome} — {o.regiao || "Cidade Tiradentes"}
                    </p>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function loadingBucket(
  tab: Tab,
  buckets: Record<string, { loading: boolean }>,
): boolean {
  if (tab === "denuncias") return buckets.denuncias.loading;
  if (tab === "areas") return buckets.areas.loading;
  return buckets.dashboard.loading;
}