// JSON-Schemas für erzwungene strukturierte Modellausgaben (Spez 19.1:
// Antworten ausschliesslich im vorgegebenen Schema, unbekannte Werte null).
// Strict Mode verlangt: alle Properties required, additionalProperties false.

export const CATEGORIES = [
  "invoice",
  "reminder",
  "insurance",
  "tax",
  "employment_social",
  "housing",
  "general",
] as const;

export type Category = (typeof CATEGORIES)[number];

// Ein extrahiertes Feld trägt immer Quellenbezug und Konfidenz (Spez 18.2)
const field = (valueType: "string" | "number") => ({
  type: "object",
  additionalProperties: false,
  properties: {
    value: { type: [valueType, "null"] },
    source_text: {
      type: ["string", "null"],
      description: "Wörtliches Zitat der Fundstelle im Dokument",
    },
    page_number: { type: ["integer", "null"] },
    confidence: { type: "number", minimum: 0, maximum: 1 },
  },
  required: ["value", "source_text", "page_number", "confidence"],
});

export type ExtractedField<T = string> = {
  value: T | null;
  source_text: string | null;
  page_number: number | null;
  confidence: number;
};

export const classificationSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    category: { type: "string", enum: [...CATEGORIES] },
    subcategory: { type: ["string", "null"] },
    language: { type: "string", description: "ISO-639-1 der Dokumentsprache" },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    requires_action: { type: ["boolean", "null"] },
    potential_financial_impact: { type: ["boolean", "null"] },
    summary: {
      type: "string",
      description: "Ein Satz: Was ist dieses Dokument?",
    },
  },
  required: [
    "category",
    "subcategory",
    "language",
    "confidence",
    "requires_action",
    "potential_financial_impact",
    "summary",
  ],
} as const;

export type Classification = {
  category: Category;
  subcategory: string | null;
  language: string;
  confidence: number;
  requires_action: boolean | null;
  potential_financial_impact: boolean | null;
  summary: string;
};

export const extractionSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    document_title: { type: ["string", "null"] },
    sender_name: field("string"),
    recipient_name: field("string"),
    document_date: {
      ...field("string"),
      description: "Datum des Dokuments im Format YYYY-MM-DD",
    },
    due_date: {
      ...field("string"),
      description: "Zahlungs-/Reaktionsfrist im Format YYYY-MM-DD",
    },
    amount: {
      type: "object",
      additionalProperties: false,
      properties: {
        value: { type: ["number", "null"] },
        currency: { type: ["string", "null"] },
        amount_type: {
          type: ["string", "null"],
          enum: ["payment_due", "refund", "info", null],
        },
        source_text: { type: ["string", "null"] },
        page_number: { type: ["integer", "null"] },
        confidence: { type: "number", minimum: 0, maximum: 1 },
      },
      required: [
        "value",
        "currency",
        "amount_type",
        "source_text",
        "page_number",
        "confidence",
      ],
    },
    reference_number: field("string"),
    account_or_iban: field("string"),
    required_actions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          action_type: {
            type: "string",
            enum: [
              "pay",
              "check",
              "respond",
              "call",
              "fill_form",
              "send_documents",
              "schedule_appointment",
              "file",
              "other",
            ],
          },
          description: { type: "string" },
          deadline: { type: ["string", "null"] },
        },
        required: ["action_type", "description", "deadline"],
      },
    },
    contact: {
      type: "object",
      additionalProperties: false,
      properties: {
        name: { type: ["string", "null"] },
        phone: { type: ["string", "null"] },
        email: { type: ["string", "null"] },
      },
      required: ["name", "phone", "email"],
    },
    recurrence: {
      type: "object",
      additionalProperties: false,
      properties: {
        is_recurring: { type: ["boolean", "null"] },
        frequency: {
          type: ["string", "null"],
          enum: ["weekly", "monthly", "quarterly", "semiannual", "yearly", null],
        },
        starts_on: { type: ["string", "null"] },
      },
      required: ["is_recurring", "frequency", "starts_on"],
    },
    period: {
      ...field("string"),
      description: "Leistungs-/Rechnungszeitraum, falls genannt",
    },
    possible_consequence: {
      ...field("string"),
      description:
        "Konsequenz bei Nichtreaktion – nur wenn wörtlich im Dokument",
    },
    uncertainties: { type: "array", items: { type: "string" } },
  },
  required: [
    "document_title",
    "sender_name",
    "recipient_name",
    "document_date",
    "due_date",
    "amount",
    "reference_number",
    "account_or_iban",
    "required_actions",
    "contact",
    "recurrence",
    "period",
    "possible_consequence",
    "uncertainties",
  ],
} as const;

export type Extraction = {
  document_title: string | null;
  sender_name: ExtractedField;
  recipient_name: ExtractedField;
  document_date: ExtractedField;
  due_date: ExtractedField;
  amount: {
    value: number | null;
    currency: string | null;
    amount_type: "payment_due" | "refund" | "info" | null;
    source_text: string | null;
    page_number: number | null;
    confidence: number;
  };
  reference_number: ExtractedField;
  account_or_iban: ExtractedField;
  required_actions: {
    action_type:
      | "pay"
      | "check"
      | "respond"
      | "call"
      | "fill_form"
      | "send_documents"
      | "schedule_appointment"
      | "file"
      | "other";
    description: string;
    deadline: string | null;
  }[];
  contact: { name: string | null; phone: string | null; email: string | null };
  recurrence: {
    is_recurring: boolean | null;
    frequency:
      | "weekly"
      | "monthly"
      | "quarterly"
      | "semiannual"
      | "yearly"
      | null;
    starts_on: string | null;
  };
  period: ExtractedField;
  possible_consequence: ExtractedField;
  uncertainties: string[];
};

export const explanationSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    what_is_it: { type: "string" },
    why_it_matters: { type: "string" },
    what_to_do: { type: "array", items: { type: "string" } },
    deadline: { type: ["string", "null"] },
    amount: {
      type: "object",
      additionalProperties: false,
      properties: {
        value: { type: ["number", "null"] },
        currency: { type: ["string", "null"] },
      },
      required: ["value", "currency"],
    },
    possible_consequence: { type: ["string", "null"] },
    uncertainties: { type: "array", items: { type: "string" } },
    recommended_task: {
      type: ["object", "null"],
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
      },
      required: ["title", "priority"],
    },
    recommended_budget_item: {
      type: ["object", "null"],
      additionalProperties: false,
      properties: {
        item_type: { type: "string", enum: ["income", "expense"] },
        category: { type: "string" },
        title: { type: "string" },
        amount: { type: "number" },
        currency: { type: "string" },
        due_date: { type: ["string", "null"] },
        is_recurring: { type: "boolean" },
      },
      required: [
        "item_type",
        "category",
        "title",
        "amount",
        "currency",
        "due_date",
        "is_recurring",
      ],
    },
  },
  required: [
    "what_is_it",
    "why_it_matters",
    "what_to_do",
    "deadline",
    "amount",
    "possible_consequence",
    "uncertainties",
    "recommended_task",
    "recommended_budget_item",
  ],
} as const;

// Antwortschema für den Dokumentchat (Spez 24.11): Antwort mit
// Quellenbezug und explizitem Unsicherheitshinweis.
export const answerSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    answer: { type: "string" },
    cited_pages: {
      type: "array",
      items: { type: "integer" },
      description: "Seitennummern, auf die sich die Antwort stützt",
    },
    uncertainty_note: {
      type: ["string", "null"],
      description:
        "Warnung, wenn die Antwort unsicher ist oder das Dokument die Frage nicht beantwortet",
    },
  },
  required: ["answer", "cited_pages", "uncertainty_note"],
} as const;

export type Answer = {
  answer: string;
  cited_pages: number[];
  uncertainty_note: string | null;
};

export type Explanation = {
  what_is_it: string;
  why_it_matters: string;
  what_to_do: string[];
  deadline: string | null;
  amount: { value: number | null; currency: string | null };
  possible_consequence: string | null;
  uncertainties: string[];
  recommended_task: {
    title: string;
    priority: "low" | "medium" | "high" | "critical";
  } | null;
  recommended_budget_item: {
    item_type: "income" | "expense";
    category: string;
    title: string;
    amount: number;
    currency: string;
    due_date: string | null;
    is_recurring: boolean;
  } | null;
};
