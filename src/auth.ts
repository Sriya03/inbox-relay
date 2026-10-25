/**
 * One-time Gmail OAuth minting helper for inbox-relay.
 *
 * Run: GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... npm run auth
 *
 * Opens (prints) a Google consent URL for the gmail.modify scope only.
 * Sign in with the Gmail account you want triaged, approve, and the local
 * server catches the redirect and saves the token to GMAIL_TOKEN_PATH
 * (default ./data/token.json, gitignored). Never commit that file.
 *
 * Notes:
 * - access_type "offline" + prompt "consent" force a refresh token, so the
 *   server keeps working without re-login every hour.
 * - Desktop OAuth clients allow any http://localhost port as a redirect
 *   URI, so no redirect URIs need configuring in Google Cloud.
 * - Expect Google's "unverified app" warning: this is your own app in
 *   Testing mode. Proceed via Advanced. Only you (a registered test user)
 *   can consent to it.
 */
import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import { dirname } from "node:path";
import { OAuth2Client } from "google-auth-library";
import { GMAIL_SCOPES } from "./gmail.js";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var ${name} (see .env.example)`);
  return value;
}

const clientId = requiredEnv("GOOGLE_CLIENT_ID");
const clientSecret = requiredEnv("GOOGLE_CLIENT_SECRET");
const tokenPath = process.env.GMAIL_TOKEN_PATH ?? "./data/token.json";
const port = Number(process.env.AUTH_PORT ?? 3000);
const redirectUri = `http://localhost:${port}`;

const oauth = new OAuth2Client(clientId, clientSecret, redirectUri);
const url = oauth.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: GMAIL_SCOPES,
});

console.log("Open this URL in your browser:\n" + url + "\n");

const server = createServer(async (req, res) => {
  const code = new URL(req.url ?? "", redirectUri).searchParams.get("code");
  if (!code) {
    res.writeHead(400);
    res.end("Missing authorization code.");
    return;
  }
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Authorization received. You can close this tab.");
  server.close();
  const { tokens } = await oauth.getToken(code);
  await fs.mkdir(dirname(tokenPath), { recursive: true });
  await fs.writeFile(tokenPath, JSON.stringify(tokens, null, 2));
  // Restrictive permissions: this file is live Gmail access. Never commit it.
  await fs.chmod(tokenPath, 0o600);
  console.log(`Token saved to ${tokenPath}. Next: npm run inspect`);
});
server.listen(port);
