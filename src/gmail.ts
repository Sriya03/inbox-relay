/**
 * Gmail access for inbox-relay.
 *
 * Scope discipline is the no-auto-send guarantee: this server requests
 * ONLY `gmail.modify` (read mail, apply labels, archive, create drafts).
 * It never requests `gmail.send` or `gmail.compose`, so sending is
 * impossible by permission, not by promise.
 *
 * Credentials live outside the repo: OAuth client id/secret come from the
 * environment, and the user token is stored at GMAIL_TOKEN_PATH
 * (default ./data/token.json, gitignored). Run the OAuth consent flow once
 * to mint the token; it is never committed.
 */
import { promises as fs } from "node:fs";
import { google, type gmail_v1 } from "googleapis";
import { OAuth2Client } from "google-auth-library";

export const GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.modify"];

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var ${name} (see .env.example)`);
  return value;
}

export async function getGmail(): Promise<gmail_v1.Gmail> {
  const oauth = new OAuth2Client(
    requiredEnv("GOOGLE_CLIENT_ID"),
    requiredEnv("GOOGLE_CLIENT_SECRET"),
    process.env.GMAIL_REDIRECT_URI ?? "http://localhost",
  );
  const tokenPath = process.env.GMAIL_TOKEN_PATH ?? "./data/token.json";
  try {
    const raw = await fs.readFile(tokenPath, "utf-8");
    oauth.setCredentials(JSON.parse(raw));
  } catch {
    throw new Error(
      `No Gmail token at ${tokenPath}. Run the OAuth consent flow once ` +
        `with scopes ${GMAIL_SCOPES.join(", ")} and save the token there.`,
    );
  }
  return google.gmail({ version: "v1", auth: oauth });
}

export async function searchMessages(query: string, maxResults = 20) {
  const gmail = await getGmail();
  const res = await gmail.users.messages.list({
    userId: "me",
    q: `in:inbox ${query}`,
    maxResults,
  });
  return res.data.messages ?? [];
}

export async function getMessage(id: string) {
  const gmail = await getGmail();
  const res = await gmail.users.messages.get({ userId: "me", id, format: "full" });
  return res.data;
}

export async function listThreads(query?: string) {
  const gmail = await getGmail();
  const res = await gmail.users.threads.list({
    userId: "me",
    q: query ? `in:inbox ${query}` : "in:inbox",
  });
  return res.data.threads ?? [];
}

export async function listLabels() {
  const gmail = await getGmail();
  const res = await gmail.users.labels.list({ userId: "me" });
  return res.data.labels ?? [];
}

/**
 * Apply a label and archive the message out of the inbox.
 * Archiving is reversible: the message stays findable under its label.
 * Low-confidence classifications must never reach this function — they stay
 * in the inbox for human review (see docs/annotation-guide.md).
 */
export async function applyLabel(messageId: string, labelId: string) {
  const gmail = await getGmail();
  await gmail.users.messages.modify({
    userId: "me",
    id: messageId,
    requestBody: { addLabelIds: [labelId], removeLabelIds: ["INBOX"] },
  });
}

/**
 * Create a DRAFT only. The user sends every draft manually from Gmail.
 * This function cannot send: the requested OAuth scope excludes sending.
 */
export async function createDraft(to: string, subject: string, body: string) {
  const gmail = await getGmail();
  const raw = Buffer.from(
    `To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset="UTF-8"\r\n\r\n${body}`,
  ).toString("base64url");
  const res = await gmail.users.drafts.create({
    userId: "me",
    requestBody: { message: { raw } },
  });
  return res.data;
}
