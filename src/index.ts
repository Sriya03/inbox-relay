/**
 * inbox-relay — MCP server that triages a recruiter inbox.
 *
 * Tools, v1 (Week 1 scaffold):
 *   search_messages, get_message, list_threads, list_labels,
 *   apply_label, create_draft
 *
 * classify_message lands in Week 2 with the rubric + LLM classifier and the
 * rules baseline. Nothing in this server sends mail: the Gmail scope
 * (gmail.modify) excludes sending, and create_draft only creates drafts.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  applyLabel,
  createDraft,
  getMessage,
  listLabels,
  listThreads,
  searchMessages,
} from "./gmail.js";

const server = new McpServer({ name: "inbox-relay", version: "0.1.0" });

server.tool(
  "search_messages",
  "Search the inbox (Gmail search syntax). Returns matching message ids.",
  { query: z.string(), max_results: z.number().optional() },
  async ({ query, max_results }) => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(await searchMessages(query, max_results ?? 20)),
      },
    ],
  }),
);

server.tool(
  "get_message",
  "Fetch one message in full: headers, body, and labels.",
  { id: z.string() },
  async ({ id }) => ({
    content: [{ type: "text", text: JSON.stringify(await getMessage(id)) }],
  }),
);

server.tool(
  "list_threads",
  "List inbox threads, optionally filtered by a Gmail search query.",
  { query: z.string().optional() },
  async ({ query }) => ({
    content: [{ type: "text", text: JSON.stringify(await listThreads(query)) }],
  }),
);

server.tool(
  "list_labels",
  "List all Gmail labels with their ids (needed before apply_label).",
  {},
  async () => ({
    content: [{ type: "text", text: JSON.stringify(await listLabels()) }],
  }),
);

server.tool(
  "apply_label",
  "Label a message AND archive it out of the inbox (reversible). Only call " +
    "this for high-confidence classifications; unsure messages stay in the inbox.",
  { message_id: z.string(), label_id: z.string() },
  async ({ message_id, label_id }) => {
    await applyLabel(message_id, label_id);
    return {
      content: [
        { type: "text", text: `Labeled ${message_id} and archived from inbox.` },
      ],
    };
  },
);

server.tool(
  "create_draft",
  "Create a Gmail DRAFT only. The user sends it manually. This never sends.",
  { to: z.string(), subject: z.string(), body: z.string() },
  async ({ to, subject, body }) => ({
    content: [
      { type: "text", text: JSON.stringify(await createDraft(to, subject, body)) },
    ],
  }),
);

await server.connect(new StdioServerTransport());
