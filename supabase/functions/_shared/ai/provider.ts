// Provider-Abstraktion (Spez 14.6): Die Pipeline kennt nur diese Interfaces.
// Erste Implementierung: providers/openai.ts (GPT-5 mini).
// Ein Anbieterwechsel bedeutet eine neue Datei, keinen Umbau der Anwendung.

import type {
  Answer,
  Classification,
  Explanation,
  Extraction,
} from "./schemas.ts";

export type DocumentInput =
  | { kind: "pdf"; filename: string; base64: string }
  | {
      kind: "images";
      pages: { pageNumber: number; base64: string; mimeType: string }[];
    };

export type ExplainRequest = {
  classification: Classification;
  extraction: Extraction;
  validationNotes: string[];
  language: string; // bevorzugte Erklärungssprache des Nutzers
  mode: "normal" | "simple"; // Darstellungsmodus (Spez 12.6)
};

export type AskRequest = {
  question: string;
  /** Bereits extrahierte Analyse-Ergebnisse als Kontext (nicht vertrauenswürdig) */
  analysisContext: unknown;
  language: string;
  mode: "normal" | "simple";
};

export interface AiProvider {
  readonly name: string;
  readonly model: string;
  readonly promptVersion: string;
  classify(doc: DocumentInput): Promise<Classification>;
  extract(doc: DocumentInput, classification: Classification): Promise<Extraction>;
  explain(request: ExplainRequest): Promise<Explanation>;
  ask(doc: DocumentInput, request: AskRequest): Promise<Answer>;
}

/** Fehler mit Hinweis, ob eine Wiederholung sinnvoll ist (Spez 21.6) */
export class ProviderError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly transient: boolean
  ) {
    super(message);
    this.name = "ProviderError";
  }
}
