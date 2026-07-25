"use client";

import { useEffect, useRef, useState } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { de } from "@/lib/i18n/de";
import { FormError, inputClass } from "@/components/common/form";
import { formatIsoDatesInText } from "@/lib/documents";

export type ChatQuestion = {
  id: string;
  question: string;
  answer: string | null;
  cited_pages: unknown;
  cited_entities: unknown;
  created_at: string;
};

function citedPagesText(value: unknown): string | null {
  if (!Array.isArray(value)) return null;
  const pages = value.filter((p): p is number => Number.isInteger(p));
  if (pages.length === 0) return null;
  return de.documents.chat.sources(pages.join(", "));
}

function uncertaintyNote(value: unknown): string | null {
  if (value && typeof value === "object" && "uncertainty_note" in value) {
    const note = (value as { uncertainty_note?: unknown }).uncertainty_note;
    return typeof note === "string" && note ? note : null;
  }
  return null;
}

// Dokumentchat (Spez 24.11) als Panel von rechts: ein dauerhaft sichtbarer
// schwebender Knopf öffnet den Chat – so wird er nicht übersehen. Antworten
// kommen synchron aus der Edge Function ask-document (Quellenbezug +
// Unsicherheits-Warnung) und werden in document_questions gespeichert.
export function DocumentChat({
  documentId,
  initialQuestions,
}: {
  documentId: string;
  initialQuestions: ChatQuestion[];
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ChatQuestion[]>(initialQuestions);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ block: "end" });
    }
  }, [open, items.length, pending]);

  async function send(question: string) {
    const trimmed = question.trim();
    if (trimmed.length < 3 || pending) return;
    setPending(true);
    setError(null);
    const supabase = createClient();

    const { data, error: fnError } = await supabase.functions.invoke(
      "ask-document",
      { body: { document_id: documentId, question: trimmed } }
    );

    if (fnError) {
      let code = "";
      if (fnError instanceof FunctionsHttpError) {
        code = (await fnError.context
          .json()
          .then((b: { error?: string }) => b.error ?? "")
          .catch(() => "")) as string;
      }
      setError(
        code === "daily_limit_reached"
          ? de.documents.chat.errors.limit
          : code === "question_too_long"
            ? de.documents.chat.errors.tooLong
            : de.documents.chat.errors.failed
      );
      setPending(false);
      return;
    }

    const saved = (data as { question?: ChatQuestion } | null)?.question;
    if (saved) {
      setItems((prev) => [...prev, saved]);
      setInput("");
    } else {
      setError(de.documents.chat.errors.failed);
    }
    setPending(false);
  }

  return (
    <>
      {/* Schwebender Chat-Knopf – immer sichtbar, oberhalb der Bottom-Nav */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-30 flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-accent-strong active:scale-95"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 10h8M8 14h5m-9 6l3.2-2.4A2 2 0 016.4 17H18a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v13z"
          />
        </svg>
        {de.documents.chat.open}
        {items.length > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/25 px-1 text-xs">
            {items.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label={de.documents.chat.close}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/30"
          />
          <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-surface shadow-2xl">
            <header className="flex items-center justify-between gap-3 border-b border-black/5 px-5 py-4">
              <div>
                <h2 className="text-[15px] font-semibold tracking-tight">
                  {de.documents.chat.title}
                </h2>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">
                  {de.documents.chat.hint}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={de.documents.chat.close}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-black/5"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length > 0 ? (
                <ul className="flex flex-col gap-3">
                  {items.map((item) => {
                    const sources = citedPagesText(item.cited_pages);
                    const note = uncertaintyNote(item.cited_entities);
                    return (
                      <li key={item.id} className="flex flex-col gap-2">
                        <p className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-sm text-white">
                          {item.question}
                        </p>
                        <div className="max-w-[90%] self-start rounded-2xl rounded-bl-md bg-black/[0.04] px-4 py-2.5">
                          <p className="whitespace-pre-line text-sm leading-relaxed">
                            {formatIsoDatesInText(item.answer ?? "")}
                          </p>
                          {sources && (
                            <p className="mt-1.5 text-xs text-muted">{sources}</p>
                          )}
                          {note && (
                            <p className="mt-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs leading-relaxed text-amber-900">
                              <span className="font-medium">
                                {de.documents.chat.uncertaintyLabel}
                              </span>{" "}
                              {formatIsoDatesInText(note)}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted">
                  {de.documents.chat.suggestedTitle}
                </p>
              )}
              {pending && (
                <div className="mt-3 flex items-center gap-2 text-sm text-muted">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  {de.documents.chat.sending}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-black/5 px-5 pb-5 pt-3">
              <FormError message={error} />
              <div className="mb-3 mt-1 flex flex-wrap gap-2">
                {de.documents.chat.suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={pending}
                    onClick={() => send(suggestion)}
                    className="rounded-full bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent-strong transition hover:bg-accent-soft/70 active:scale-[0.98] disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={de.documents.chat.placeholder}
                  maxLength={500}
                  className={inputClass}
                />
                <button
                  type="submit"
                  disabled={pending || input.trim().length < 3}
                  className="shrink-0 rounded-xl bg-accent px-4 py-3 text-sm font-medium text-white transition hover:bg-accent-strong active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {de.documents.chat.send}
                </button>
              </form>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
