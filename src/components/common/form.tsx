// Kleine, wiederverwendbare Formularbausteine (mobile-first, grosse Touch-Flächen)

export const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-base outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

export const buttonPrimaryClass =
  "w-full rounded-xl bg-accent px-4 py-3 text-base font-medium text-white transition hover:bg-accent-strong active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";

export const buttonSecondaryClass =
  "w-full rounded-xl bg-accent-soft px-4 py-3 text-base font-medium text-accent-strong transition hover:bg-accent-soft/70 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";

export const labelClass = "mb-1 block text-sm font-medium text-foreground";

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {message}
    </p>
  );
}

export function FormNotice({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="status" className="rounded-xl bg-accent-soft px-4 py-3 text-sm text-accent-strong">
      {message}
    </p>
  );
}
