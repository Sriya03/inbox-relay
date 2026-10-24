/**
 * The inbox-relay label taxonomy.
 *
 * Labels describe a message's content, never how the application happened:
 * a reject is `rejects` whether the application was manual or auto-applied.
 * See docs/annotation-guide.md for definitions, signals, and tie-break rules.
 */
export const LABELS = [
  "interview",
  "offer-process",
  "recruiter/new",
  "recruiter/replied",
  "rejects",
  "application",
  "read-later",
  "promos",
] as const;

export type Label = (typeof LABELS)[number];

/** Most action-relevant label wins when a message fits two labels. */
export const LABEL_PRECEDENCE: Label[] = [
  "offer-process",
  "interview",
  "rejects",
  "recruiter/replied",
  "recruiter/new",
  "application",
  "read-later",
  "promos",
];
