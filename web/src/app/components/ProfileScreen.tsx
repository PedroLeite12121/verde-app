import { useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  AlertTriangle,
  BookOpen,
  Info,
  Lock,
  LogOut,
  MapPin,
  Shield,
} from "lucide-react";
import { api, type Area, type Denuncia, type Projeto } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { useFetch } from "../../lib/use-fetch";
import { Card, DataError, EmptyState, initials, Loading, num, StatusBadge } from "./ui";

const DEN_STATUS = {
  aberta: { label: "Aberta", join: "badge-error" },
  "em tratamento": { label: "Em tratamento", join: "badge-warning" },
  resolvido: { label: "Resolvida", join: "badge-success" },
};

export function ProfileScreen() {
  const { user, tipo, signOut } = useAuth();
  const navigate = useNavigate();

  const denuncias = useFetch<Denuncia[]>(() => api.get("/denuncias").then((r) => r.denuncias));
  const areas = useFetch<Area[]>(() => api.get("/areas").then((r) => r.areas));
  const projetos = useFetch<Projeto[]>(() => api.get("/projetos").then((r) => r.projetos));

  const mine = useMemo(
    () => (denuncias.data ?? []).filter((d) => d.usuario?.idUsuario === user?.idUsuario),
    [denuncias.data, user?.idUsuario],
  );

  const isAdmin = tipo === "admin";

  const stats = [
    { label: "Minhas denúncias", value: num(mine.length) },
    { label: "Áreas mapeadas", value: num(areas.data?.length) },
    { label: "Projetos", value: num(projetos.data?.length) },
  ];

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[var(--background)]">
      {/* Cover */}
      <div className="bg-gradient-to-br from-secondary via-[#0E4C33] to-primary px-5 pb-16 pt-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">
          +Verde · Perfil
        </p>
        <div className="mt-10 flex items-end justify-between">
          <div className="flex size-16 items-center justify-center rounded-3xl border-2 border-white/30 bg-[#1A6B44] font-display text-xl font-semibold text-white">
            {initials(user?.nome ?? "?")}
          </div>
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/12 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur"
            >
              <Shield size={13} strokeWidth={2} /> Painel da ONG
            </Link>
          )}
        </div>
      </div>

      {/* Identidade */}
      <div className="-mt-7 px-5 pb-4">
        <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_4px_16px_rgba(12,51,34,0.08)]">
          <p className="font-display text-lg font-semibold text-foreground">{user?.nome}</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{user?.email}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-base-200 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <MapPin size={11} className="text-primary" /> Cidade Tiradentes · zona leste
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl bg-base-200/60 px-2 py-2.5 text-center">
                <p className="font-display text-xl font-semibold text-foreground">{s.value}</p>
                <p className="text-[10px] font-medium leading-tight text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Minhas denúncias */}
      <div className="px-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Minhas denúncias
        </p>
        {denuncias.loading ? (
          <Loading />
        ) : denuncias.error ? (
          <DataError error={denuncias.error} onRetry={denuncias.reload} />
        ) : mine.length === 0 ? (
          <Card>
            <EmptyState
              title="Nada por aqui ainda"
              hint="Quando você denunciar uma área, ela aparece aqui com o andamento."
            />
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {mine.map((d) => (
              <Card key={d.idDenuncias} className="flex items-center justify-between gap-3 px-4 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{d.titulo}</p>
                  <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                    <MapPin size={11} className="shrink-0 text-primary" />
                    {d.area?.rua || d.area?.bairro || "Cidade Tiradentes"} · {d.dataDenuncia}
                  </p>
                </div>
                <StatusBadge status={d.statusDenuncia} map={DEN_STATUS} />
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Configure */}
      <div className="px-5 pt-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Configurações
        </p>
        <Card className="divide-y divide-black/[0.05]">
          {[
            { Icon: AlertTriangle, label: "Notificações", sub: "Alertas de denúncias e mutirões" },
            { Icon: Lock, label: "Privacidade", sub: "Seus dados e permissões" },
            { Icon: BookOpen, label: "Sobre o +Verde", sub: "Proposta, equipe e parceiros" },
            { Icon: Info, label: "Termos e uso", sub: "Política da plataforma" },
          ].map(({ Icon, label, sub }) => (
            <button
              key={label}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-base-200/40"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-base-200 text-muted-foreground">
                <Icon size={16} strokeWidth={1.9} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            </button>
          ))}
        </Card>

        <button
          onClick={() => {
            signOut();
            navigate("/login", { replace: true });
          }}
          className="btn mt-4 w-full border border-error/20 bg-error/[0.06] text-sm font-semibold text-error hover:bg-error/10"
        >
          <LogOut size={15} /> Sair da conta
        </button>

        <p className="mt-5 pb-8 text-center text-[11px] text-muted-foreground/70">
          +Verde · Cidade Tiradentes — arborização urbana comunitária
        </p>
      </div>
    </div>
  );
}