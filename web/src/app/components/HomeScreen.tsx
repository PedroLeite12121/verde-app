import { useNavigate, Link } from "react-router";
import { AlertTriangle, ArrowRight, BookOpen, Leaf, MapPin, Sprout, TreePine, Users } from "lucide-react";
import { api, type Area, type Denuncia, type Ong, type Projeto } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { useFetch } from "../../lib/use-fetch";
import { Card, DataError, Eyebrow, Loading, num } from "./ui";

const statusDot: Record<string, string> = {
  aberta: "bg-error",
  "em tratamento": "bg-warning",
  resolvido: "bg-success",
};

function CoverageMiniMap() {
  return (
    <svg viewBox="0 0 340 170" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
      <rect width="340" height="170" fill="#1f3d2e" />
      <g stroke="#2c4f3a" strokeWidth="2">
        <path d="M0 60h340M0 118h340M80 0v170M185 0v170M292 0v170" />
      </g>
      <g fill="#2f5b40" opacity="0.85">
        <rect x="10" y="8" width="60" height="44" rx="5" />
        <rect x="92" y="8" width="80" height="44" rx="5" />
        <rect x="196" y="8" width="84" height="44" rx="5" />
        <rect x="10" y="66" width="60" height="46" rx="5" />
        <rect x="92" y="66" width="80" height="46" rx="5" />
        <rect x="196" y="66" width="84" height="46" rx="5" />
        <rect x="10" y="124" width="60" height="42" rx="5" />
        <rect x="92" y="124" width="80" height="42" rx="5" />
        <rect x="196" y="124" width="84" height="42" rx="5" />
      </g>
      <g>
        <rect x="92" y="8" width="80" height="44" rx="5" fill="#B3402A" opacity="0.75" />
        <rect x="10" y="124" width="60" height="42" rx="5" fill="#B3402A" opacity="0.65" />
        <rect x="196" y="66" width="84" height="46" rx="5" fill="#DB9E36" opacity="0.7" />
      </g>
      <circle cx="132" cy="30" r="8" fill="#A7D7B8" />
      <circle cx="132" cy="30" r="14" fill="#A7D7B8" opacity="0.18" />
      <circle cx="40" cy="145" r="6" fill="#F3B27A" />
      <circle cx="238" cy="89" r="6" fill="#DB9E36" />
      <circle cx="40" cy="145" r="11" fill="#F3B27A" opacity="0.18" />
    </svg>
  );
}

export function HomeScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const areas = useFetch<Area[]>(() => api.get("/areas").then((r) => r.areas));
  const denuncias = useFetch<Denuncia[]>(() => api.get("/denuncias").then((r) => r.denuncias));
  const ongs = useFetch<Ong[]>(() => api.get("/ongs").then((r) => r.ongs));
  const projetos = useFetch<Projeto[]>(() => api.get("/projetos").then((r) => r.projetos));

  const loading = areas.loading || denuncias.loading || ongs.loading || projetos.loading;
  const errored = areas.error || denuncias.error || ongs.error || projetos.error;

  const areaList = areas.data ?? [];
  const denList = denuncias.data ?? [];
  const ongList = ongs.data ?? [];
  const projList = projetos.data ?? [];

  const deficit = areaList.filter((a) => a.statusArea !== "reflorestada").length;
  const abertas = denList.filter((d) => d.statusDenuncia !== "resolvido");

  const firstName = user?.nome?.split(/\s+/)[0] ?? "";

  const reloadAll = () => {
    areas.reload();
    denuncias.reload();
    ongs.reload();
    projetos.reload();
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[var(--background)]">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-10 border-b border-black/[0.06] bg-[var(--background)]/90 px-4 pb-3 pt-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {firstName ? `Olá, ${firstName}` : "Bem-vindo(a)"}
            </p>
            <h1 className="mt-0.5 font-display text-[1.25rem] font-semibold tracking-tight text-foreground">
              +Verde Cidade Tiradentes
            </h1>
          </div>
          <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Leaf size={18} strokeWidth={2} />
          </span>
        </div>
      </header>

      <div className="flex flex-col gap-3.5 px-4 pb-6 pt-4">
        {loading ? (
          <Loading label="Carregando…" />
        ) : errored ? (
          <DataError error={"Não foi possível carregar os dados."} onRetry={reloadAll} />
        ) : (
          <>
            {/* ── Passo principal ── */}
            <Card className="overflow-hidden !border-0 bg-gradient-to-br from-secondary via-[#0E4C33] to-primary p-5 text-white">
              <Eyebrow className="text-white/55">Como ajudar</Eyebrow>
              <h2 className="mt-2 font-display text-[1.45rem] font-semibold leading-tight tracking-tight">
                Encontrou uma área sem árvores?
              </h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/70">
                Registre em menos de um minuto. As ONGs parceiras recebem sua denúncia e agem no
                local.
              </p>
              <button
                onClick={() => navigate("/denunciar")}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-[#0E4C33] active:scale-[0.99]"
              >
                <AlertTriangle size={16} strokeWidth={2.2} />
                Denunciar agora
              </button>
            </Card>

            {/* ── Números ── */}
            <div className="grid grid-cols-4 gap-2">
              <MiniStat Icon={TreePine} label="Áreas" value={num(areaList.length)} />
              <MiniStat Icon={AlertTriangle} label="Abertas" value={num(abertas.length)} />
              <MiniStat Icon={Users} label="ONGs" value={num(ongList.length)} />
              <MiniStat Icon={Sprout} label="Projetos" value={num(projList.length)} />
            </div>

            {/* ── Mapa (preview) ── */}
            <button
              onClick={() => navigate("/mapa")}
              className="relative h-[170px] overflow-hidden rounded-3xl text-left shadow-[0_10px_30px_rgba(12,51,34,0.25)]"
            >
              <CoverageMiniMap />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B2116]/95 via-[#0B2116]/40 to-transparent" />

              <div className="absolute left-3 top-3 flex gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
                  <MapPin size={10} /> Cidade Tiradentes
                </span>
                {deficit > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-error px-2.5 py-1 text-[10px] font-bold text-white">
                    <AlertTriangle size={10} /> {num(deficit)} com déficit
                  </span>
                )}
              </div>

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                <div>
                  <p className="text-[11px] font-medium text-white/60">Áreas mapeadas</p>
                  <p className="mt-0.5 font-display text-[2rem] font-semibold leading-none text-white">
                    {num(areaList.length)}
                  </p>
                  <p className="mt-1 text-[11px] text-white/55">
                    {num(deficit)} precisam de arborização
                  </p>
                </div>
                <span className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur">
                  Ver mapa <ArrowRight size={13} />
                </span>
              </div>
            </button>

            {/* ── Alertas em aberto ── */}
            {abertas.length > 0 && (
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
                    Alertas em aberto
                  </p>
                  <Link to="/mapa" className="text-xs font-semibold text-primary hover:underline">
                    Ver todas
                  </Link>
                </div>
                <div>
                  {abertas.slice(0, 4).map((d, i) => (
                    <Link
                      key={d.idDenuncia}
                      to="/mapa"
                      className={`flex items-center gap-3 px-4 py-3 ${
                        i > 0 ? "border-t border-black/[0.05]" : ""
                      }`}
                    >
                      <span className={`size-2 shrink-0 rounded-full ${statusDot[d.statusDenuncia] ?? "bg-base-300"}`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{d.titulo}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {d.area?.rua || d.area?.bairro || "Cidade Tiradentes"} · {d.dataDenuncia}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] font-semibold capitalize text-muted-foreground">
                        {d.statusDenuncia}
                      </span>
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            {/* ── Educação ── */}
            <Link
              to="/educacao"
              className="group flex items-center gap-4 rounded-2xl border border-black/[0.05] bg-white px-4 py-3.5"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpen size={20} strokeWidth={1.9} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Educação Ambiental</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Artigos, vídeos e dados sobre a arborização.
                </p>
              </div>
              <ArrowRight size={17} className="text-muted-foreground" />
            </Link>

            <div className="h-2" />
          </>
        )}
      </div>
    </div>
  );
}

function MiniStat({
  Icon,
  label,
  value,
}: {
  Icon: typeof TreePine;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-black/[0.06] bg-white px-1 py-3">
      <Icon size={16} className="text-primary" strokeWidth={2} />
      <span className="font-display text-lg font-semibold leading-none text-foreground">{value}</span>
      <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
    </div>
  );
}