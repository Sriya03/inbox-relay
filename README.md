# inbox-relay

An MCP server that triages a recruiter inbox: **read, label, draft**.
It never sends mail — by permission, not by promise.

## What it does

- Searches and reads recruiter mail over Gmail
- Labels threads into eight categories: `interview`, `offer-process`,
  `recruiter/new`, `recruiter/replied`, `rejects`, `application`,
  `read-later`, `promos`
- Archives labeled mail out of the inbox (reversible — everything stays
  findable under its label)
- Drafts replies for you to send manually

## What it never does

- **Send mail.** The only Gmail scope requested is `gmail.modify` (read,
  label, archive, create drafts). The `gmail.send` scope is never requested,
  so sending is impossible even if the code tried.
- **Auto-archive unsure mail.** Low-confidence classifications stay in the
  inbox for human review.

## Quickstart

```bash
npm install
npm run build
```

Set up a Google Cloud OAuth client (Desktop app), enable the Gmail API, and
put the credentials in your environment (see `.env.example`). Run the OAuth
consent flow once to mint a token at `GMAIL_TOKEN_PATH` — that file is
gitignored and never committed. Then:

```bash
npm start
# or inspect the tools live:
npm run inspect
```

## Tools (v1)

| Tool | What it does |
| --- | --- |
| `search_messages` | Gmail search over the inbox |
| `get_message` | Fetch one message in full |
| `list_threads` | Thread-level inbox view |
| `list_labels` | All Gmail labels + ids |
| `apply_label` | Label + archive (high-confidence only) |
| `create_draft` | Draft only — you send it |

`classify_message` (category + priority + confidence + reason) lands in
Week 2 with the rubric-driven LLM classifier and the rules baseline.

## Labels

See [`docs/annotation-guide.md`](docs/annotation-guide.md) for definitions,
signals, precedence rules, and the thread-history rule (cold-outreach vs
recruiter/new is decided by thread history, not memory).

## Evals

The golden dataset is the contract: see [`evals/README.md`](evals/README.md).
Real mail stays local and gitignored; the public repo carries no real emails,
only the annotation guide and the eval methodology.

## Project status

Week 1 scaffold: server skeleton, Gmail wiring for search/get/labels/drafts,
taxonomy, annotation guide. Week 2: classifier + rules baseline scored.
Week 3: draft tool polish, LLM classifier scored vs baseline, eval write-up.

## License

MIT.
