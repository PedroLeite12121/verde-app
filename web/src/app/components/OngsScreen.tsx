import { useState } from "react";
import { AtSign, ChevronDown, MapPin, Phone, Sprout, UserRound } from "lucide-react";
import { api, type Ong, type Projeto } from "../../lib/api";
import { useFetch } from "../../lib/use-fetch";
import { Card, DataError, EmptyState, initials, Loading, num } from "./ui";

export function OngsScreen() {
  const [tab, setTab] = useState<"ongs" | "projetos">("ongs");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [following, setFollowing] = useState<Set<number>>(new Set());

  const ongs = useFetch<Ong[]>(() => api.get("/ongs").then((r) => r.ongs));
  const projetos = useFetch<Projeto[]>(() => api.get("/projetos").then((r) => r.projetos));

  const toggleFollow = (id: number) =>
    setFollowing((f) => {
      const next = new Set(f);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="flex h-full flex-col bg-[var(--background)]">
      {/* Header */}
      <div className="border-b border-black/[0.06] px-4 pt-4">
        <p className="mb-1 font-display text-[13px] italic text-muted-foreground">
          Redes de reflorestamento
        </p>
        <h1 className="text-[1.35rem] text-foreground">ONGs e Projetos</h1>
        <div className="mt-3 flex">
          {[["ongs", "ONGs"], ["projetos", "Meus projetos"]].map(([k, lbl]) => (
            <button
              key={k}
              onClick={() => setTab(k as typeof tab)}
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

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {tab === "ongs" ? (
          ongs.loading ? (
            <Loading label="Carregando ONGs…" />
          ) : ongs.error ? (
            <DataError error={ongs.error} onRetry={ongs.reload} />
          ) : (ongs.data ?? []).length === 0 ? (
            <EmptyState title="Nenhuma ONG por aqui" hint="ONGs parceiras vão aparecer nesta lista." />
          ) : (
            <div className="flex flex-col gap-2.5">
              {ongs.data!.map((o) => {
                const name = o.usuario?.nome ?? "ONG parceira";
                const open = expanded === o.idOngs;
                const isFollowing = following.has(o.idOngs);
                return (
                  <Card key={o.idOngs} className="overflow-hidden">
                    <div className="flex gap-3 px-4 py-3.5">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-sm font-bold text-secondary-content">
                        {initials(name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{name}</p>
                            <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                              <MapPin size={11} className="text-primary" />
                              {o.regiao || "Cidade Tiradentes"}
                            </p>
                          </div>
                          <button
                            onClick={() => toggleFollow(o.idOngs)}
                            className={`btn btn-sm rounded-full text-xs font-semibold ${
                              isFollowing ? "btn-secondary" : "btn-outline"
                            }`}
                          >
                            {isFollowing ? "Seguindo" : "Seguir"}
                          </button>
                        </div>
                        {o.descricao && (
                          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                            {o.descricao}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setExpanded(open ? null : o.idOngs)}
                      className="flex w-full items-center justify-between border-t border-black/[0.05] bg-base-200/40 px-4 py-2.5"
                    >
                      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <UserRound size={13} className="text-primary" />
                        CNPJ {o.cnpj || "—"} · Contato e parceiros
                      </span>
                      <ChevronDown
                        size={14}
                        className={`text-base-300 transition-transform ${open ? "rotate-180" : ""}`}
                      />
                    </button>

                    {open && (
                      <div className="flex gap-2 border-t border-black/[0.05] px-4 py-3">
                        {o.telefone && (
                          <a
                            href={`tel:${o.telefone.replace(/\D/g, "")}`}
                            className="btn btn-ghost btn-sm flex-1 border border-black/10 text-xs font-semibold text-foreground"
                          >
                            <Phone size={13} /> {o.telefone}
                          </a>
                        )}
                        {o.usuario?.email && (
                          <button
                            onClick={() => navigator.clipboard?.writeText(o.usuario!.email!)}
                            className="btn btn-primary btn-sm flex-1 text-xs font-semibold"
                          >
                            <AtSign size={13} /> E-mail
                          </button>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )
        ) : projetos.loading ? (
          <Loading label="Carregando projetos…" />
        ) : projetos.error ? (
          <DataError error={projetos.error} onRetry={projetos.reload} />
        ) : (projetos.data ?? []).length === 0 ? (
          <EmptyState
            title="Você ainda não participa de projetos"
            hint="Crie um projeto de arborização ou acompanhe iniciativas das ONGs parceiras."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {projetos.data!.map((p) => {
              const pct = Math.round(p.percentualConclusao);
              return (
                <Card key={p.id_Projeto} className="px-4 py-4">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Sprout size={18} strokeWidth={1.9} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{p.objetivo}</p>
                        <p className="text-xs text-muted-foreground">Meu projeto</p>
                      </div>
                    </div>
                    <span className="font-display text-lg font-semibold text-primary">{pct}%</span>
                  </div>
                  {p.descricao && (
                    <p className="mb-3 text-[13px] leading-relaxed text-muted-foreground">
                      {p.descricao}
                    </p>
                  )}
                  <div className="h-1.5 overflow-hidden rounded-full bg-base-200">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] font-medium text-muted-foreground">
                    {num(p.id_Projeto)} · atualizado automaticamente
                  </p>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}