import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { AlertTriangle, Crosshair, Navigation, Search } from "lucide-react";
import { api, type Area, type Denuncia } from "../../lib/api";
import { useFetch } from "../../lib/use-fetch";
import { Card, DataError, EmptyState, Loading, StatusBadge, num } from "./ui";

export const CT_CENTER = { lat: -23.569, lng: -46.419 };

const AREA_COLORS: Record<string, string> = {
  identificada: "#B3402A",
  "em tratamento": "#DB9E36",
  reflorestada: "#2E8B57",
};

const AREA_STATUS: Record<string, { label: string; join: string }> = {
  identificada: { label: "Déficit de arborização", join: "badge-error" },
  "em tratamento": { label: "Em tratamento", join: "badge-warning" },
  reflorestada: { label: "Reflorestada", join: "badge-success" },
};

const DEN_STATUS: Record<string, { label: string; join: string }> = {
  aberta: { label: "Aberta", join: "badge-error" },
  "em tratamento": { label: "Em tratamento", join: "badge-warning" },
  resolvido: { label: "Resolvida", join: "badge-success" },
};

type Tab = "areas" | "denuncias";

const AREA_FILTERS = [
  { key: "all", label: "Todos" },
  { key: "identificada", label: "Déficit" },
  { key: "em tratamento", label: "Em tratamento" },
  { key: "reflorestada", label: "Reflorestadas" },
] as const;

const DEN_FILTERS = [
  { key: "all", label: "Todas" },
  { key: "aberta", label: "Abertas" },
  { key: "em tratamento", label: "Em tratamento" },
  { key: "resolvido", label: "Resolvidas" },
] as const;

type Row = {
  key: string;
  kind: "area" | "denuncia";
  title: string;
  sub: string;
  status: string;
  lat: number | null;
  lng: number | null;
};

function pinIcon(color: string, label?: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:26px;height:26px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:13px;font-family:DM Sans,sans-serif;">${label ?? ""}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

function userIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#2563EB;border:3px solid #fff;box-shadow:0 0 0 6px rgba(37,99,235,.25),0 2px 10px rgba(0,0,0,.35);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function MapController({ user }: { user: { lat: number; lng: number } | null }) {
  const map = useMap();
  const prev = useRef<string | null>(null);
  useEffect(() => {
    if (!user) return;
    const key = `${user.lat.toFixed(4)},${user.lng.toFixed(4)}`;
    if (key !== prev.current) {
      prev.current = key;
      map.flyTo([user.lat, user.lng], 14, { duration: 1.2 });
    }
  }, [user, map]);
  return null;
}

function haversineM(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function fmtDist(m: number | null) {
  if (m === null) return "";
  if (m < 1000) return `a ${Math.round(m)} m`;
  return `a ${(m / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km`;
}

export function MapScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("areas");
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const areas = useFetch<Area[]>(() => api.get("/areas").then((r) => r.areas));
  const denuncias = useFetch<Denuncia[]>(() => api.get("/denuncias").then((r) => r.denuncias));

  const areaList = areas.data ?? [];
  const denList = denuncias.data ?? [];

  const rows: Row[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (tab === "areas") {
      const f = filter || "all";
      return areaList
        .filter((a) => (f === "all" ? true : a.statusArea === f))
        .filter(
          (a) =>
            !q ||
            a.rua.toLowerCase().includes(q) ||
            a.bairro.toLowerCase().includes(q) ||
            a.cidade.toLowerCase().includes(q),
        )
        .map((a) => ({
          key: `a-${a.idArea}`,
          kind: "area" as const,
          title: a.rua,
          sub: a.bairro || "Cidade Tiradentes",
          status: a.statusArea,
          lat: a.latitude,
          lng: a.longitude,
        }));
    }
    const f = filter || "all";
    return denList
      .filter((d) => (f === "all" ? true : d.statusDenuncia === f))
      .filter(
        (d) =>
          !q ||
          d.titulo.toLowerCase().includes(q) ||
          (d.area?.rua || "").toLowerCase().includes(q),
      )
      .map((d) => ({
        key: `d-${d.idDenuncias}`,
        kind: "denuncia" as const,
        title: d.titulo,
        sub: `${d.area?.rua || d.area?.bairro || "Cidade Tiradentes"} · ${d.dataDenuncia}`,
        status: d.statusDenuncia,
        lat: d.area?.latitude ?? null,
        lng: d.area?.longitude ?? null,
      }));
  }, [tab, filter, query, areaList, denList]);

  const sortedRows = useMemo(() => {
    const list = [...rows];
    if (userPos) {
      list.sort((a, b) => {
        const da =
          a.lat !== null && a.lng !== null
            ? haversineM(userPos.lat, userPos.lng, a.lat, a.lng)
            : Infinity;
        const db =
          b.lat !== null && b.lng !== null
            ? haversineM(userPos.lat, userPos.lng, b.lat, b.lng)
            : Infinity;
        return da - db;
      });
    }
    return list;
  }, [rows, userPos]);

  const markers = sortedRows.filter((r) => r.lat !== null && r.lng !== null);

  const changeTab = (t: Tab) => {
    setTab(t);
    setFilter("all");
    setQuery("");
    setSelected(null);
  };

  const locate = () => {
    setLocError(null);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        setUserPos(null);
        setLocating(false);
        setLocError(err.code === 1 ? "Permita o acesso à localização para ver o que está perto." : "Não foi possível obter sua localização.");
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  const loading = areas.loading || denuncias.loading;
  const error = areas.error || denuncias.error;

  return (
    <div className="flex h-full flex-col bg-[var(--background)]">
      {/* ── Topo ── */}
      <div className="border-b border-black/[0.06] px-4 pb-3 pt-4">
        <p className="mb-1 font-display text-[13px] italic text-muted-foreground">
          Cidade Tiradentes · zona leste
        </p>
        <h1 className="text-[1.35rem] text-foreground">Mapa Ambiental</h1>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-black/[0.07] bg-white px-3.5 py-2.5">
          <Search size={15} className="shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tab === "areas" ? "Buscar rua ou bairro…" : "Buscar denúncia…"}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
          />
        </div>
      </div>

      {/* ── Camada + filtros ── */}
      <div className="flex flex-col gap-2.5 border-b border-black/[0.06] px-4 py-3">
        <div className="flex rounded-xl bg-base-200/70 p-1">
          {([["areas", `${num(areaList.length)} áreas`], ["denuncias", `${num(denList.length)} denúncias`]] as [Tab, string][]).map(([k, l]) => (
            <button
              key={k}
              onClick={() => changeTab(k)}
              className={`flex-1 rounded-lg py-2 text-[13px] font-semibold transition-colors ${
                tab === k ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {(tab === "areas" ? AREA_FILTERS : DEN_FILTERS).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                filter === f.key
                  ? "bg-primary text-white"
                  : "bg-base-200/70 text-muted-foreground hover:bg-base-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Mapa real ── */}
      <div className="relative h-[40vh] shrink-0 overflow-hidden">
        <MapContainer
          center={[CT_CENTER.lat, CT_CENTER.lng]}
          zoom={13}
          minZoom={11}
          zoomControl={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController user={userPos} />

          {markers.map((r) => {
            const color =
              r.kind === "area"
                ? (AREA_COLORS[r.status] ?? AREA_COLORS.identificada)
                : "#C9731D";
            const pulse = r === selected;
            return (
              <Marker
                key={r.key}
                position={[r.lat!, r.lng!]}
                icon={pulse ? pinIcon(color, "✓") : pinIcon(color, r.kind === "area" ? "" : "!")}
                eventHandlers={{ click: () => setSelected(r) }}
              />
            );
          })}

          {userPos && (
            <>
              <Circle center={[userPos.lat, userPos.lng]} radius={1800} pathOptions={{ color: "#2563EB", weight: 1.5, opacity: 0.8, fillColor: "#2563EB", fillOpacity: 0.08 }} />
              <Marker position={[userPos.lat, userPos.lng]} icon={userIcon()} />
            </>
          )}
        </MapContainer>

        {/* Locate me */}
        <button
          onClick={locate}
          disabled={locating}
          className="absolute right-3 top-3 z-[600] flex size-11 items-center justify-center rounded-full border border-black/[0.07] bg-white/95 text-primary shadow-[0_2px_12px_rgba(20,36,27,0.18)] disabled:opacity-60"
          aria-label="Minha localização"
        >
          {locating ? <Crosshair size={18} className="animate-spin" /> : <Navigation size={18} />}
        </button>

        {userPos && (
          <span className="absolute left-3 top-3 z-[600] flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-foreground shadow-[0_2px_10px_rgba(20,36,27,0.15)]">
            <span className="size-2 rounded-full bg-blue-600" /> Você está aqui
          </span>
        )}
      </div>

      {locError && (
        <p className="flex items-center gap-2 bg-error/10 px-4 py-2 text-xs font-medium text-error">
          <AlertTriangle size={13} className="shrink-0" /> {locError}
        </p>
      )}

      {/* ── Lista (mais próximas) ── */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-3">
        {loading ? (
          <Loading label="Carregando…" />
        ) : error ? (
          <DataError error={error} onRetry={() => { areas.reload(); denuncias.reload(); }} />
        ) : sortedRows.length === 0 ? (
          <EmptyState title="Nada por aqui" hint="Ajuste a busca ou os filtros." />
        ) : (
          <>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {userPos ? "Mais próximas de você" : "Áreas e denúncias"}
              {userPos && (
                <span className="ml-1.5 font-normal normal-case text-muted-foreground/70">
                  · ordenado por distância
                </span>
              )}
            </p>
            <div className="flex flex-col gap-2">
              {sortedRows.map((r) => {
                const dist =
                  userPos && r.lat !== null && r.lng !== null
                    ? haversineM(userPos.lat, userPos.lng, r.lat, r.lng)
                    : null;
                const active = selected?.key === r.key;
                return (
                  <button
                    key={r.key}
                    onClick={() => setSelected(active ? null : r)}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors ${
                      active
                        ? "border-primary/40 bg-primary/[0.06]"
                        : "border-black/[0.06] bg-white"
                    }`}
                  >
                    <span
                      className="size-3 shrink-0 rounded-full"
                      style={{
                        background:
                          r.kind === "area"
                            ? (AREA_COLORS[r.status] ?? AREA_COLORS.identificada)
                            : "#C9731D",
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{r.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {r.sub}
                        {dist !== null && <span className="font-medium text-primary"> · {fmtDist(dist)}</span>}
                      </p>
                    </div>
                    <StatusBadge
                      status={r.status}
                      map={r.kind === "area" ? AREA_STATUS : DEN_STATUS}
                    />
                  </button>
                );
              })}
            </div>

            {/* ── Ação do selecionado ── */}
            {selected && (
              <Card className="mt-3 !border-primary/30 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  {selected.kind === "area" ? "Área selecionada" : "Denúncia selecionada"}
                </p>
                <p className="mt-1.5 font-display text-lg font-semibold leading-snug text-foreground">
                  {selected.title}
                </p>
                {selected.kind === "area" && selected.status === "identificada" && (
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                    Esta área ainda não tem árvores. Sua denúncia ajuda a ONG a priorizar o local.
                  </p>
                )}
                <button
                  onClick={() =>
                    navigate("/denunciar", {
                      state: { address: selected.title },
                    })
                  }
                  className="btn btn-primary mt-3 w-full text-sm font-semibold"
                >
                  {selected.kind === "area" ? "Denunciar esta área" : "Ver minha denúncia"}
                </button>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}