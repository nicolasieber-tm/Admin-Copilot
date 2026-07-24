import Link from "next/link";
import { de } from "@/lib/i18n/de";
import { formatChf, formatMonth } from "@/lib/budget";

export type MonthOverview = {
  /** "YYYY-MM" */
  month: string;
  income: number;
  expenses: number;
  /** null = kein Plan vorhanden */
  projected: number | null;
  isCurrent: boolean;
};

function monthShort(month: string): string {
  return new Intl.DateTimeFormat("de-CH", {
    month: "short",
    timeZone: "Europe/Zurich",
  }).format(new Date(`${month}-15T12:00:00Z`));
}

// Budget-Hero (Start-Tab): grosse Verfügbar-Zahl, Einnahmen/Ausgaben-Balken
// für den laufenden Monat und ein Mini-Monatsverlauf. Reines Server-Rendering,
// Balken als CSS-Breiten/Höhen – keine Chart-Bibliothek.
export function BudgetOverviewCard({ months }: { months: MonthOverview[] }) {
  const current = months.find((m) => m.isCurrent);
  const income = current?.income ?? 0;
  const expenses = current?.expenses ?? 0;
  const projected = current?.projected ?? 0;
  const barMax = Math.max(income, expenses, 1);
  const trendMax = Math.max(...months.map((m) => Math.abs(m.projected ?? 0)), 1);
  const hasAnyData = months.some((m) => m.projected != null);

  return (
    <Link
      href="/budget"
      className="block rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-black/5 transition hover:ring-accent/30"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
        {de.dashboard.budget}
      </h2>

      {hasAnyData ? (
        <>
          <p className="mt-2 text-xs text-muted">{de.dashboard.available}</p>
          <p
            className={`text-3xl font-bold tracking-tight ${
              projected < 0 ? "text-red-700" : "text-emerald-700"
            }`}
          >
            {formatChf(projected)}
          </p>

          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs text-muted">
                {de.budget.summary.income}
              </span>
              <span className="h-3 flex-1 overflow-hidden rounded-full bg-black/[0.06]">
                <span
                  className="block h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.round((income / barMax) * 100)}%` }}
                />
              </span>
              <span className="w-24 shrink-0 text-right text-xs font-medium">
                {formatChf(income)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs text-muted">
                {de.budget.summary.expenses}
              </span>
              <span className="h-3 flex-1 overflow-hidden rounded-full bg-black/[0.06]">
                <span
                  className="block h-full rounded-full bg-accent"
                  style={{ width: `${Math.round((expenses / barMax) * 100)}%` }}
                />
              </span>
              <span className="w-24 shrink-0 text-right text-xs font-medium">
                {formatChf(expenses)}
              </span>
            </div>
          </div>

          {projected < 0 && (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-800">
              {de.budget.summary.negative}
            </p>
          )}

          <div className="mt-5 border-t border-black/5 pt-3">
            <p className="mb-2 text-xs text-muted">
              <span className="font-medium">{de.dashboard.trend}</span>
              {" · "}
              {de.dashboard.trendHint}
            </p>
            <div className="flex items-end justify-between gap-2">
              {months.map((m) => {
                const value = m.projected ?? 0;
                const height =
                  m.projected == null
                    ? 4
                    : Math.max(8, Math.round((Math.abs(value) / trendMax) * 56));
                return (
                  <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                    <span
                      className={`text-[10px] tabular-nums ${
                        value < 0 ? "font-medium text-red-700" : "text-muted"
                      }`}
                    >
                      {m.projected == null ? "–" : formatChf(value).replace("CHF ", "")}
                    </span>
                    <span
                      title={`${formatMonth(m.month)}: ${
                        m.projected == null ? "keine Daten" : formatChf(value)
                      }`}
                      className={`w-full max-w-9 rounded-t-md ${
                        m.projected == null
                          ? "bg-black/10"
                          : value < 0
                            ? "bg-red-400"
                            : m.isCurrent
                              ? "bg-accent"
                              : "bg-accent/40"
                      }`}
                      style={{ height: `${height}px` }}
                    />
                    <span
                      className={`text-[10px] ${
                        m.isCurrent ? "font-semibold" : "text-muted"
                      }`}
                    >
                      {monthShort(m.month)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <p className="mt-2 text-sm text-muted">{de.dashboard.noBudget}</p>
      )}
    </Link>
  );
}
