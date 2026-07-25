import Link from "next/link";
import { de } from "@/lib/i18n/de";
import { formatChf } from "@/lib/budget";

type HeroProps = {
  name: string | null;
  email: string | null;
  hasPlan: boolean;
  projected: number;
  income: number;
  expenses: number;
  openTasks: number;
};

function initialsOf(name: string | null, email: string | null): string {
  const source = (name ?? "").trim() || (email ?? "").trim();
  if (!source) return "·";
  const parts = source.split(/\s+/).filter(Boolean);
  const letters =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : parts[0][0];
  return letters.toUpperCase();
}

/** Betrag ohne Währungskürzel – im Kopf steht CHF nur bei der grossen Zahl */
function plain(value: number): string {
  return formatChf(value).replace("CHF ", "");
}

// Tiefsee-Kopf des Start-Tabs (Design-Entscheid D2): Begrüssung mit Avatar,
// Verfügbar-Zahl, drei tippbare Kennzahl-Kacheln und die Ausgaben-Quote.
export function DashboardHero({
  name,
  email,
  hasPlan,
  projected,
  income,
  expenses,
  openTasks,
}: HeroProps) {
  const now = new Date();
  const dateLabel = new Intl.DateTimeFormat("de-CH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Zurich",
  }).format(now);
  const monthLabel = new Intl.DateTimeFormat("de-CH", {
    month: "long",
    timeZone: "Europe/Zurich",
  }).format(now);
  const quota =
    hasPlan && income > 0 ? Math.round((expenses / income) * 100) : null;

  return (
    <section
      className="hero-gradient -mx-4 -mt-6 px-5 pb-14 text-white"
      style={{ paddingTop: "calc(1.5rem + env(safe-area-inset-top))" }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold tracking-tight">
            {name ? `Hallo ${name}` : de.dashboard.title}
          </h1>
          <p className="text-xs text-white/60">{dateLabel}</p>
        </div>
        <Link
          href="/settings"
          aria-label={de.dashboard.profileOpen}
          title={de.dashboard.profileOpen}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-bold tracking-wide ring-1 ring-inset ring-white/20 transition hover:bg-white/25"
        >
          {initialsOf(name, email)}
        </Link>
      </div>

      <p className="mt-6 text-[11px] font-semibold uppercase tracking-wider text-white/65">
        {de.dashboard.availableIn(monthLabel)}
      </p>

      {hasPlan ? (
        <>
          <p
            className={`mt-0.5 text-[2.5rem] font-bold leading-tight tracking-tight tabular-nums ${
              projected < 0 ? "text-red-300" : ""
            }`}
          >
            {formatChf(projected)}
          </p>

          <div className="mt-4 flex gap-2.5">
            <Link
              href="/budget"
              className="min-w-0 flex-1 rounded-2xl bg-white/10 px-3 py-2.5 ring-1 ring-inset ring-white/10 transition hover:bg-white/15"
            >
              <span className="block truncate text-[10.5px] text-white/65">
                {de.budget.summary.income}
              </span>
              <span className="block truncate text-sm font-semibold tabular-nums">
                + {plain(income)}
              </span>
            </Link>
            <Link
              href="/budget"
              className="min-w-0 flex-1 rounded-2xl bg-white/10 px-3 py-2.5 ring-1 ring-inset ring-white/10 transition hover:bg-white/15"
            >
              <span className="block truncate text-[10.5px] text-white/65">
                {de.budget.summary.expenses}
              </span>
              <span className="block truncate text-sm font-semibold tabular-nums">
                − {plain(expenses)}
              </span>
            </Link>
            <Link
              href="/tasks"
              className="min-w-0 flex-1 rounded-2xl bg-white/10 px-3 py-2.5 ring-1 ring-inset ring-white/10 transition hover:bg-white/15"
            >
              <span className="block truncate text-[10.5px] text-white/65">
                {de.dashboard.openDeadlines}
              </span>
              <span className="block text-sm font-semibold tabular-nums">
                {openTasks}
              </span>
            </Link>
          </div>

          {quota != null && (
            <div className="mt-4">
              <div className="flex items-baseline justify-between text-[11px] text-white/70">
                <span>{de.dashboard.quota}</span>
                <span className="font-semibold tabular-nums text-white">
                  {quota} %
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/20">
                <span
                  className={`block h-full rounded-full bg-gradient-to-r ${
                    quota > 100
                      ? "from-red-300 to-red-200"
                      : "from-teal-300 to-white"
                  }`}
                  style={{ width: `${Math.min(quota, 100)}%` }}
                />
              </div>
            </div>
          )}
        </>
      ) : (
        <div>
          <p className="mt-1 max-w-[36ch] text-sm leading-relaxed text-white/75">
            {de.dashboard.noBudget}
          </p>
          <Link
            href="/budget"
            className="mt-3 inline-block rounded-full bg-white/15 px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-white/20 transition hover:bg-white/25"
          >
            {de.budget.title} →
          </Link>
        </div>
      )}
    </section>
  );
}
