import { useEffect, useState, type FormEvent } from "react";
import {
  AtSign,
  ChevronDown,
  MapPin,
  Phone,
  Plus,
  Sprout,
  TriangleAlert,
  UserRound,
  X,
} from "lucide-react";
import { api, type Ong, type Projeto } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { useFetch } from "../../lib/use-fetch";
import {
  Card,
  DataError,
  EmptyState,
  initials,
  Loading,
  num,
} from "./ui";

export function OngsScreen() {
  const { tipo } = useAuth();

  const [tab, setTab] = useState<"ongs" | "projetos">("ongs");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [following, setFollowing] = useState<Set<number>>(new Set());
  const [updatingFollow, setUpdatingFollow] = useState<number | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [objetivo, setObjetivo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const ongs = useFetch<Ong[]>(() =>
    api.get("/ongs?statusOng=aprovada").then((r) => r.ongs),
  );

  const projetos = useFetch<Projeto[]>(() =>
    api.get("/projetos").then((r) => r.projetos),
  );

  const followedOngs = useFetch<Ong[]>(() =>
    api.get("/ongs/following").then((r) => r.ongs),
  );

  useEffect(() => {
    setFollowing(
      new Set((followedOngs.data ?? []).map((ong) => ong.idOng)),
    );
  }, [followedOngs.data]);

  const toggleFollow = async (id: number) => {
    const isFollowing = following.has(id);

    setUpdatingFollow(id);

    try {
      if (isFollowing) {
        await api.del(`/ongs/${id}/follow`);

        setFollowing((current) => {
          const next = new Set(current);
          next.delete(id);
          return next;
        });
      } else {
        await api.post(`/ongs/${id}/follow`);

        setFollowing((current) => {
          const next = new Set(current);
          next.add(id);
          return next;
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar ONG seguida", error);
    } finally {
      setUpdatingFollow(null);
    }
  };

  async function createProjeto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError(null);

    if (!objetivo.trim() || !descricao.trim()) {
      setCreateError("Preencha o objetivo e a descrição do projeto.");
      return;
    }

    setCreating(true);

    try {
      await api.post("/projetos", {
        objetivo: objetivo.trim(),
        descricao: descricao.trim(),
      });

      setObjetivo("");
      setDescricao("");
      setCreateOpen(false);
      projetos.reload();
    } catch (error) {
      setCreateError(
        error instanceof Error
          ? error.message
          : "Não foi possível criar o projeto.",
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-[var(--background)]">
      <div className="border-b border-black/[0.06] px-4 pt-4">
        <p className="mb-1 font-display text-[13px] italic text-muted-foreground">
          Redes de reflorestamento
        </p>

        <h1 className="text-[1.35rem] text-foreground">ONGs e Projetos</h1>

        <div className="mt-3 flex">
          {[
            ["ongs", "ONGs"],
            ["projetos", "Projetos"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key as typeof tab)}
              className={`flex-1 border-b-2 pb-3 text-sm transition-colors ${
                tab === key
                  ? "border-primary font-semibold text-foreground"
                  : "border-transparent font-medium text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {tab === "projetos" && tipo === "ong" && (
          <div className="mb-4 flex">
            <button
              type="button"
              onClick={() => {
                setCreateError(null);
                setCreateOpen(true);
              }}
              className="btn btn-primary btn-sm w-full text-xs font-semibold"
            >
              <Plus size={15} />
              Criar projeto
            </button>
          </div>
        )}

        {tab === "ongs" ? (
          ongs.loading ? (
            <Loading label="Carregando ONGs…" />
          ) : ongs.error ? (
            <DataError error={ongs.error} onRetry={ongs.reload} />
          ) : (ongs.data ?? []).length === 0 ? (
            <EmptyState
              title="Nenhuma ONG por aqui"
              hint="ONGs parceiras vão aparecer nesta lista."
            />
          ) : (
            <div className="flex flex-col gap-2.5">
              {ongs.data!.map((ong) => {
                const name = ong.nome ?? "ONG parceira";
                const open = expanded === ong.idOng;
                const isFollowing = following.has(ong.idOng);

                return (
                  <Card key={ong.idOng} className="overflow-hidden">
                    <div className="flex gap-3 px-4 py-3.5">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-sm font-bold text-secondary-content">
                        {initials(name)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {name}
                            </p>

                            <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                              <MapPin size={11} className="text-primary" />
                              {ong.regiao || "Cidade Tiradentes"}
                            </p>
                          </div>

                          <button
                            onClick={() => toggleFollow(ong.idOng)}
                            disabled={updatingFollow === ong.idOng}
                            className={`btn btn-sm rounded-full text-xs font-semibold ${
                              isFollowing ? "btn-secondary" : "btn-outline"
                            }`}
                          >
                            {updatingFollow === ong.idOng
                              ? "..."
                              : isFollowing
                                ? "Seguindo"
                                : "Seguir"}
                          </button>
                        </div>

                        {ong.descricao && (
                          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                            {ong.descricao}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setExpanded(open ? null : ong.idOng)
                      }
                      className="flex w-full items-center justify-between border-t border-black/[0.05] bg-base-200/40 px-4 py-2.5"
                    >
                      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <UserRound size={13} className="text-primary" />
                        CNPJ {ong.cnpj || "—"} · Contato e parceiros
                      </span>

                      <ChevronDown
                        size={14}
                        className={`text-base-300 transition-transform ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {open && (
                      <div className="flex gap-2 border-t border-black/[0.05] px-4 py-3">
                        {ong.telefone && (
                          <a
                            href={`tel:${ong.telefone.replace(/\D/g, "")}`}
                            className="btn btn-ghost btn-sm flex-1 border border-black/10 text-xs font-semibold text-foreground"
                          >
                            <Phone size={13} /> {ong.telefone}
                          </a>
                        )}

                        {ong.usuario?.email && (
                          <button
                            onClick={() =>
                              navigator.clipboard?.writeText(
                                ong.usuario!.email!,
                              )
                            }
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
            title="Nenhum projeto incluído ainda"
            hint="Acompanhe iniciativas das ONGs parceiras."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {projetos.data!.map((projeto) => {
              const pct = Math.round(projeto.percentualConclusao);

              return (
                <Card
                  key={projeto.idProjeto}
                  className="px-4 py-4"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Sprout size={18} strokeWidth={1.9} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {projeto.objetivo}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {projeto.ong?.nome || "ONG parceira"}
                        </p>
                      </div>
                    </div>

                    <span className="font-display text-lg font-semibold text-primary">
                      {pct}%
                    </span>
                  </div>

                  {projeto.descricao && (
                    <p className="mb-3 text-[13px] leading-relaxed text-muted-foreground">
                      {projeto.descricao}
                    </p>
                  )}

                  <div className="h-1.5 overflow-hidden rounded-full bg-base-200">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>

                  <p className="mt-2 text-[11px] font-medium text-muted-foreground">
                    {num(projeto.idProjeto)} · atualizado automaticamente
                  </p>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 md:items-center">
          <form
            onSubmit={createProjeto}
            className="w-full max-w-md rounded-2xl bg-[var(--background)] p-5 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Novo projeto
              </h2>

              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                disabled={creating}
                aria-label="Fechar"
                className="rounded-lg p-2 text-muted-foreground hover:bg-base-200"
              >
                <X size={18} />
              </button>
            </div>

            <label className="mb-3 block">
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Objetivo
              </span>

              <input
                required
                maxLength={50}
                value={objetivo}
                onChange={(event) => setObjetivo(event.target.value)}
                placeholder="Ex.: Plantar 50 árvores na região"
                className="w-full rounded-xl border border-black/[0.08] bg-white px-3.5 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-primary"
              />
            </label>

            <label className="mb-4 block">
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Descrição
              </span>

              <textarea
                required
                rows={3}
                maxLength={100}
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
                placeholder="Descreva os detalhes do projeto..."
                className="w-full resize-none rounded-xl border border-black/[0.08] bg-white px-3.5 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-primary"
              />
            </label>

            {createError && (
              <div className="mb-3 flex items-start gap-2 rounded-xl border border-error/25 bg-error/10 px-3.5 py-3 text-[13px] text-error">
                <TriangleAlert size={15} className="mt-0.5 shrink-0" />
                {createError}
              </div>
            )}

            <button
              type="submit"
              disabled={creating || !objetivo.trim() || !descricao.trim()}
              className="btn btn-primary w-full text-sm font-semibold disabled:opacity-60"
            >
              {creating ? "Criando…" : "Criar projeto"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}