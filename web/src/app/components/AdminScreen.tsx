import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  MapPin,
  Sprout,
  TreePine,
  Users,
  XCircle,
} from "lucide-react";
import {
  api,
  type Area,
  type Denuncia,
  type Ong,
  type Projeto,
} from "../../lib/api";
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
  aberta: { label: "Aberta", join: "badge-error px-2 py-1" },
  "em tratamento": { label: "Em tratamento", join: "badge-warning px-2 py-1" },
  resolvido: { label: "Resolvida", join: "badge-success px-2 py-1" },
};

const AREA_STATUS = {
  identificada: { label: "Identificada", join: "badge-error px-2 py-1" },
  "em tratamento": { label: "Em tratamento", join: "badge-warning px-2 py-1" },
  reflorestada: { label: "Reflorestada", join: "badge-success px-2 py-1" },
};

const ONG_STATUS = {
  pendente: { label: "Pendente", join: "badge-warning px-2 py-1" },
  aprovada: { label: "Aprovada", join: "badge-success px-2 py-1" },
  rejeitada: { label: "Rejeitada", join: "badge-error px-2 py-1" },
};

type Tab = "ongs" | "denuncias" | "areas" | "visao";

export function AdminScreen() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("denuncias");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedOngId, setSelectedOngId] = useState<number | null>(null);
  const [updating, setUpdating] = useState(false);

  const dashboard = useFetch<Stats>(() =>
    api.get("/admin/dashboard").then((r) => r.stats),
  );

  const denuncias = useFetch<Denuncia[]>(() =>
    api.get("/admin/denuncias").then((r) => r.denuncias),
  );

  const areas = useFetch<Area[]>(() =>
    api.get("/admin/areas").then((r) => r.areas),
  );

  const ongs = useFetch<Ong[]>(() =>
    api.get("/admin/ongs").then((r) => r.ongs),
  );

  const projetos = useFetch<Projeto[]>(() =>
    api.get("/admin/projetos").then((r) => r.projetos),
  );

  const selected = useMemo(
    () =>
      (denuncias.data ?? []).find(
        (denuncia) => denuncia.idDenuncia === selectedId,
      ) ?? null,
    [denuncias.data, selectedId],
  );

  const pendingOngs = useMemo(
    () =>
      (ongs.data ?? []).filter(
        (ong) => ong.statusOng?.toLowerCase() === "pendente",
      ),
    [ongs.data],
  );

  const selectedOng = useMemo(
    () =>
      pendingOngs.find((ong) => ong.idOng === selectedOngId) ?? null,
    [pendingOngs, selectedOngId],
  );

  const deficitAreas = useMemo(
    () =>
      (areas.data ?? []).filter(
        (area) => area.statusArea !== "reflorestada",
      ),
    [areas.data],
  );

  async function updateStatus(id: number, status: string) {
    setUpdating(true);

    try {
      await api.put(`/denuncias/${id}`, {
        statusDenuncia: status,
      });

      setSelectedId(null);
      denuncias.reload();
      dashboard.reload();
    } finally {
      setUpdating(false);
    }
  }

  async function updateOngStatus(
    id: number,
    action: "approve" | "reject",
  ) {
    setUpdating(true);

    try {
      await api.put(`/admin/ong/${id}/${action}`);

      setSelectedOngId(null);
      ongs.reload();
      dashboard.reload();
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="flex h-full w-full items-center justify-center md:p-6">
      <div className="flex h-full w-full flex-col overflow-hidden bg-[var(--background)] md:h-[min(880px,calc(100dvh-48px))] md:max-w-[430px] md:rounded-[30px] md:shadow-[0_0_0_1px_rgba(255,255,255,0.07),0_40px_90px_rgba(0,0,0,0.55)]">
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
              <h1 className="font-display text-lg font-semibold text-white">
                Dashboard
              </h1>
            </div>
          </div>

          {dashboard.loading ? (
            <div className="mt-4 h-14 animate-pulse rounded-2xl bg-white/15" />
          ) : dashboard.data ? (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                {
                  v: dashboard.data.denunciasAbertas,
                  l: "Abertas",
                  c: "text-[#F3B27A]",
                },
                {
                  v: dashboard.data.totalDenuncias,
                  l: "Denúncias",
                  c: "text-[#B8E6C9]",
                },
                {
                  v: dashboard.data.totalONGs,
                  l: "ONGs",
                  c: "text-[#F7D9A0]",
                },
              ].map((stat) => (
                <div
                  key={stat.l}
                  className="rounded-2xl bg-white/12 px-2 py-2.5 text-center"
                >
                  <p
                    className={`font-display text-2xl font-semibold ${stat.c}`}
                  >
                    {num(stat.v)}
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold text-white/60">
                    {stat.l}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex border-b border-black/[0.06] bg-[var(--background)]">
          {[
            ["denuncias", "Denúncias"],
            ["ongs", "ONGs pendentes"],
            ["areas", "Áreas"],
            ["visao", "Visão geral"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setTab(key as Tab);
                setSelectedId(null);
                setSelectedOngId(null);
              }}
              className={`flex-1 border-b-2 py-2.5 text-xs font-semibold transition-colors ${
                tab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loadingBucket(tab, {
            denuncias,
            areas,
            ongs,
            projetos,
            dashboard,
          }) ? (
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
                      <p className="text-sm font-semibold text-foreground">
                        {selected.titulo}
                      </p>

                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin size={11} className="text-primary" />
                        {selected.area?.rua ||
                          selected.area?.bairro ||
                          "Cidade Tiradentes"}
                      </p>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {selected.usuario?.nome} · {selected.dataDenuncia}
                      </p>
                    </div>

                    <StatusBadge
                      status={selected.statusDenuncia}
                      map={DEN_STATUS}
                    />
                  </div>

                  {selected.descricao && (
                    <div className="mb-4 rounded-xl bg-base-200/50 px-3.5 py-3 text-[13px] leading-relaxed text-foreground">
                      {selected.descricao}
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <button
                      disabled={
                        updating ||
                        selected.statusDenuncia === "em tratamento"
                      }
                      onClick={() =>
                        updateStatus(
                          selected.idDenuncia,
                          "em tratamento",
                        )
                      }
                      className="btn btn-warning w-full text-sm font-semibold disabled:opacity-50"
                    >
                      <Clock3 size={15} /> Marcar em tratamento
                    </button>

                    <button
                      disabled={
                        updating ||
                        selected.statusDenuncia === "resolvido"
                      }
                      onClick={() =>
                        updateStatus(selected.idDenuncia, "resolvido")
                      }
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

                {(denuncias.data ?? []).map((denuncia) => (
                  <button
                    key={denuncia.idDenuncia}
                    onClick={() => setSelectedId(denuncia.idDenuncia)}
                    className="text-left"
                  >
                    <Card className="flex items-center gap-3 px-4 py-3.5">
                      <span
                        className={`size-2 shrink-0 rounded-full ${
                          denuncia.statusDenuncia === "aberta"
                            ? "bg-error"
                            : denuncia.statusDenuncia === "em tratamento"
                              ? "bg-warning"
                              : "bg-success"
                        }`}
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {denuncia.titulo}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {denuncia.usuario?.nome} ·{" "}
                          {denuncia.area?.rua ||
                            denuncia.area?.bairro ||
                            "—"}{" "}
                          · {denuncia.dataDenuncia}
                        </p>
                      </div>

                      <StatusBadge
                        status={denuncia.statusDenuncia}
                        map={DEN_STATUS}
                      />
                    </Card>
                  </button>
                ))}
              </div>
            )
          ) : tab === "ongs" ? (
            selectedOng ? (
              <div className="flex flex-col gap-3 px-4 py-4">
                <button
                  onClick={() => setSelectedOngId(null)}
                  className="inline-flex items-center gap-1.5 self-start text-[13px] font-semibold text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft size={14} /> Voltar
                </button>

                <Card className="p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {selectedOng.usuario?.nome ||
                          selectedOng.nome ||
                          "ONG"}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {selectedOng.regiao || "Região não informada"}
                      </p>

                      {selectedOng.cnpj && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          CNPJ: {selectedOng.cnpj}
                        </p>
                      )}

                      {selectedOng.telefone && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Telefone: {selectedOng.telefone}
                        </p>
                      )}
                    </div>

                    <StatusBadge
                      status={selectedOng.statusOng}
                      map={ONG_STATUS}
                    />
                  </div>

                  {selectedOng.descricao && (
                    <div className="mb-4 rounded-xl bg-base-200/50 px-3.5 py-3 text-[13px] leading-relaxed text-foreground">
                      {selectedOng.descricao}
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <button
                      disabled={updating}
                      onClick={() =>
                        updateOngStatus(selectedOng.idOng, "approve")
                      }
                      className="btn btn-success w-full text-sm font-semibold disabled:opacity-50"
                    >
                      <CheckCircle2 size={15} /> Aprovar ONG
                    </button>

                    <button
                      disabled={updating}
                      onClick={() =>
                        updateOngStatus(selectedOng.idOng, "reject")
                      }
                      className="btn btn-error w-full text-sm font-semibold disabled:opacity-50"
                    >
                      <XCircle size={15} /> Rejeitar ONG
                    </button>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col gap-2 px-4 py-4">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {num(pendingOngs.length)} ONGs aguardando aprovação
                </p>

                {pendingOngs.map((ong) => (
                  <button
                    key={ong.idOng}
                    onClick={() => setSelectedOngId(ong.idOng)}
                    className="text-left"
                  >
                    <Card className="flex items-center gap-3 px-4 py-3.5">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Users size={16} strokeWidth={1.9} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {ong.usuario?.nome || ong.nome || "ONG"}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {ong.regiao || "Região não informada"}
                        </p>
                      </div>

                      <StatusBadge
                        status={ong.statusOng}
                        map={ONG_STATUS}
                      />
                    </Card>
                  </button>
                ))}

                {pendingOngs.length === 0 && (
                  <Card className="p-4 text-center text-sm text-muted-foreground">
                    Nenhuma ONG pendente.
                  </Card>
                )}
              </div>
            )
          ) : tab === "areas" ? (
            <div className="flex flex-col gap-2 px-4 py-4">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {num(areas.data?.length)} áreas mapeadas
              </p>

              {(areas.data ?? []).map((area) => (
                <Card
                  key={area.idArea}
                  className="flex items-center gap-3 px-4 py-3.5"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <TreePine size={16} strokeWidth={1.9} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {area.rua || area.bairro || area.cidade}
                    </p>

                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                      <MapPin size={11} className="text-primary" />
                      {area.bairro || area.cidade || "Cidade Tiradentes"}
                    </p>
                  </div>

                  <StatusBadge
                    status={area.statusArea}
                    map={AREA_STATUS}
                  />
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4 px-4 py-4">
              {dashboard.data && (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      l: "Usuários",
                      v: dashboard.data.totalUsuarios,
                      Icon: Users,
                      tone: "text-info bg-info/10",
                    },
                    {
                      l: "Áreas",
                      v: dashboard.data.totalAreas,
                      Icon: TreePine,
                      tone: "text-primary bg-primary/10",
                    },
                    {
                      l: "Denúncias",
                      v: dashboard.data.totalDenuncias,
                      Icon: AlertTriangle,
                      tone: "text-error bg-error/10",
                    },
                    {
                      l: "Projetos",
                      v: dashboard.data.totalProjetos,
                      Icon: Sprout,
                      tone: "text-success bg-success/10",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.l}
                      className={`flex items-center gap-3 rounded-2xl ${stat.tone.split(" ")[1]} p-3.5`}
                    >
                      <stat.Icon
                        size={17}
                        strokeWidth={1.9}
                        className={stat.tone.split(" ")[0]}
                      />

                      <div>
                        <p className="font-display text-xl font-semibold leading-none text-foreground">
                          {num(stat.v)}
                        </p>
                        <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                          {stat.l}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Card className="p-4">
                <p className="text-sm font-semibold text-foreground">
                  Áreas com déficit de arborização
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {num(deficitAreas.length)} áreas ainda precisam de intervenção
                </p>

                <div className="mt-3 flex flex-col">
                  {deficitAreas.slice(0, 5).map((area, index) => (
                    <div
                      key={area.idArea}
                      className={`flex items-center justify-between gap-2 py-2.5 ${
                        index > 0 ? "border-t border-black/[0.05]" : ""
                      }`}
                    >
                      <p className="truncate text-[13px] font-medium text-foreground">
                        {area.rua || area.bairro || area.cidade}
                      </p>

                      <StatusBadge
                        status={area.statusArea}
                        map={AREA_STATUS}
                      />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <p className="text-sm font-semibold text-foreground">
                  ONGs cadastradas · {num(ongs.data?.length)}
                </p>

                <div className="mt-2 flex flex-col">
                  {(ongs.data ?? []).map((ong, index) => (
                    <div
                      key={ong.idOng}
                      className={`flex items-center justify-between gap-3 py-2.5 ${
                        index > 0 ? "border-t border-black/[0.05]" : ""
                      }`}
                    >
                      <p className="min-w-0 truncate text-[13px] text-muted-foreground">
                        {ong.usuario?.nome || ong.nome || "ONG"} —{" "}
                        {ong.regiao || "Cidade Tiradentes"}
                      </p>

                      <StatusBadge status={ong.statusOng} map={ONG_STATUS} />
                    </div>
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
  if (tab === "ongs") return buckets.ongs.loading;
  if (tab === "areas") return buckets.areas.loading;

  return buckets.dashboard.loading;
}