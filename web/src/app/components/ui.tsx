import type { ReactNode } from "react";
import { Inbox, LoaderCircle, TriangleAlert } from "lucide-react";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground ${className ?? ""}`}>
      {children}
    </p>
  );
}

export function PageHead({
  title,
  eyebrow,
  right,
}: {
  title: string;
  eyebrow?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 px-4 pb-3 pt-4">
      <div>
        {eyebrow && (
          <p className="mb-1 font-display text-[13px] font-medium italic text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[1.35rem] text-foreground">{title}</h1>
      </div>
      {right}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(20,36,27,0.05)] ${className}`}
    >
      {children}
    </div>
  );
}

export function StatusBadge({
  status,
  map,
  fallbackJoin = "badge-neutral",
}: {
  status: string | null | undefined;
  map: Record<string, { label: string; join: string }>;
  fallbackJoin?: string;
}) {
  const cfg = status ? map[status] : undefined;
  return (
    <span className={`badge badge-sm gap-1 font-medium ${cfg?.join ?? fallbackJoin}`}>
      {cfg?.label ?? status ?? "—"}
    </span>
  );
}

export function StatusDot({ status, map, fallback = "bg-base-300" }: { status?: string | null; map: Record<string, string>; fallback?: string }) {
  return (
    <span
      className={`inline-block size-[9px] shrink-0 rounded-full ${status ? (map[status] ?? fallback) : fallback}`}
    />
  );
}

export function Loading({ label = "Carregando…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <LoaderCircle size={22} className="animate-spin text-primary" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-8 py-14 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-base-200 text-muted-foreground">
        <Inbox size={20} strokeWidth={1.6} />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {hint && <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorNote({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="mx-4 my-6 flex items-start gap-3 rounded-xl border border-error/25 bg-error/10 px-4 py-3">
      <TriangleAlert size={17} className="mt-0.5 shrink-0 text-error" />
      <div className="flex-1">
        <p className="text-sm text-error">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-1 text-[13px] font-semibold text-primary underline-offset-2 hover:underline"
          >
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
}

export function DataError({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message =
    error instanceof Error ? error.message : "Não foi possível carregar os dados.";
  return <ErrorNote message={message} onRetry={onRetry} />;
}

export function num(n: number | undefined | null): string {
  return (n ?? 0).toLocaleString("pt-BR");
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}