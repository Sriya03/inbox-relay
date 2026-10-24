# Relay Annotation Guide — Golden Dataset v1

**Purpose.** This is the labeling contract for Relay's golden dataset. No message
gets labeled from vibes: every label below has a definition, signals to look for,
and a tie-break rule. When a new edge case shows up, it gets written into this
guide — the guide is versioned like code, and disagreements between labelers are
resolved by updating the guide, not by arguing.

**Scope.** Recruiter inbox triage only. The classifier labels what it recognizes;
anything it can't place confidently stays unlabeled in the inbox. Forcing a label
on an unsure message is worse than skipping it.

**Dataset shape (v1).** ~150 messages, split by thread (never by message — the
same thread in both dev and test is leakage):
- Dev set: ~100 messages, used for iteration and tuning.
- Locked test set: ~50 messages, scored only for final evaluation. Never tuned
  against. Frozen across versions.
- Sampling is stratified across all seven labels, across time (recent + older
  threads), and deliberately includes hard cases.

**Privacy.** Real emails stay local and gitignored. The dataset never enters the
public repo. The public write-up uses redacted or synthetic examples only.

---

## Labels

### `interview`
**Definition:** Anything about an active interview process — invites, scheduling,
confirmations, round feedback, interviewer details, prep requests from the
company side.

**Signals:** Interviewer names, dates/times, video links, "next round",
"panel", "onsite", "technical screen", scheduling tools.

**Example patterns:** "Your interview with [team] is scheduled for Thursday",
"Next step: 45-min technical round with the hiring manager."

### `offer-process`
**Definition:** Offers, negotiations, compensation discussion, background checks,
onboarding paperwork, start-date coordination.

**Signals:** "Offer letter", salary/equity numbers, "background check",
"start date", "onboarding", benefits paperwork.

**Example patterns:** "We're excited to extend an offer", "Please complete the
background authorization form."

### `recruiter/new`
**Definition:** Fresh, personalized outreach for a plausible role that the owner has
not yet answered.

**Signals:** Named recruiter, specific role + company, reference to her
background or profile, a direct question ("are you open to a chat?").

**Example patterns:** "I came across your profile and have a Forward Deployed
Engineer role that fits the owner's background."

### `recruiter/replied`
**Definition:** An ongoing recruiter thread where the owner has already responded —
follow-ups, check-ins, and continuations of a conversation she is part of.

**Signals:** "Following up on my last note", "just checking in", references to a
prior exchange, second/third message in a thread she answered.

**Example patterns:** "Wanted to circle back on the role we discussed last
week."

### `rejects`
**Definition:** A rejection, pass, or "we went with another candidate" message —
including polite ones that invite future applications.

**Signals:** "We decided to move forward with other candidates", "not the right
fit at this time", "we'll keep your resume on file", "unfortunately".

**Tie-break:** A rejection that invites future roles is still `rejects`, not
`recruiter/new`. The outcome (no) beats the politeness (maybe later).

### `application`
**Definition:** Confirmation or acknowledgment that an application was received —
from a manual application or an auto-applied one (e.g., via an auto-apply
tool). Process started, outcome pending.

**Signals:** "Thanks for applying", "we received your application",
"your application for [role]", application reference numbers.

**Example patterns:** "Thank you for applying to [role] at [company]."

**Why it exists:** It is the thread anchor for auto-applied applications. When
a reply or reject later arrives from a company the owner doesn't remember
applying to, the confirmation answers "who is this?" — and it gives a single
view of everything applied to, including forgotten auto-applications.

### `read-later`
**Definition:** Newsletters, study material, and courses the owner wants to read later.
This is a real bucket, never lumped with promos.

**Signals:** Course platforms, tech newsletters, engineering blogs, career
newsletters, study material, conference/workshop content.

**Example patterns:** A weekly AI engineering newsletter, a course platform
update, a study guide, a career-advice newsletter.

**Tie-break:** A newsletter that is also a sales pitch for a course still
counts as `read-later` if the content is educational. A pure discount blast
with no content is `promos`.

### `promos`
**Definition:** Retail and marketing blasts — the actual inbox crowding.

**Signals:** Discount codes, sales events, product launches, loyalty rewards,
"Buy 2 Get 2", seasonal offers.

**Example patterns:** Retail sale announcements, food-delivery promos, coupon
blasts.

### Leave unlabeled
Bank statements, flight receipts, travel confirmations, bills, and anything
personal/admin. Also: any message where the label is genuinely unclear — mark
low confidence and leave it in the inbox. An unsure label is a bug, not data.

---

## Precedence (when a message fits two labels)

The most action-relevant label wins, in this order:

1. `offer-process` — money and start dates outrank everything.
2. `interview` — an active round outranks a general thread.
3. `rejects` — a closed outcome outranks an open thread.
4. `recruiter/replied` — an ongoing conversation outranks a fresh one.
5. `recruiter/new`
6. `application`
7. `read-later`
8. `promos`

**Thread rule:** Label each message on its own content. A thread's rollup label
is its latest message's label (a thread that went interview → rejection rolls
up to `rejects`).

**Thread-history rule:** `cold-outreach` vs `recruiter/new` is decided by thread
history, not by the owner's memory. If an application confirmation exists in
the thread, a recruiter reply is `recruiter/new` (or `interview`, if that's
what it is) — even if the owner doesn't remember applying. `cold-outreach`
is only for mail with no prior application behind it. Otherwise auto-applied
applications would all misclassify as cold outreach.

---

## Priority (separate from category)

- **High:** Needs action within ~48 hours. Interview invite/scheduling, offer
  with a deadline, a recruiter awaiting a reply on an active process.
- **Medium:** Active process, no immediate deadline. Ongoing recruiter threads,
  interview prep material for a confirmed round.
- **Low:** No action needed. `read-later` and `promos` are always Low unless
  a specific item carries a deadline (e.g., a course enrollment window).

## Confidence

- **High:** The label follows directly from the definition and signals above.
- **Low:** Ambiguous, fits two labels even after precedence, or missing
  context. Low-confidence messages are NOT auto-archived — they stay in the
  inbox for human review, and they are the most valuable adjudication cases.

---

## Labeling process (production rules)

1. **Guide first.** No labeling starts until this guide is approved. New edge
   cases update the guide (with a changelog entry) before they update the data.
2. **Two passes.** The owner labels as domain expert; a second labeler does a blind
   pass on a subset. Agreement is measured; every disagreement is adjudicated
   and written back into this guide as a new edge case.
3. **Dev/test discipline.** The locked test set is scored only for final
   evaluation. No tuning, no peeking, no "just one fix" against it.
4. **Versioning.** Dataset versions (v1, v2, …) carry a changelog: what was
   added, what was relabeled, and why. Relabels require a guide change.
5. **Failure-driven growth.** Every classifier miss goes back into the golden
   set (or its pattern does). Eval → fail → fix → re-eval.
6. **Sizing.** ~25 messages per labeling session, ~6 sessions for v1. Quality
   over quantity: 150 well-labeled messages beat 500 sloppy ones.

---

## Changelog

- **v1 (Oct 24, 2026):** Initial guide. Seven labels; `read-later` split out
  from promos per owner correction (newsletters/study material are not noise);
  `rejects` added; `cold-outreach` folded into `promos` vs `recruiter/new`
  distinction (personalized + plausible = recruiter; mass blast = promos).
  Mode: label + archive. Auto-archive gated on high confidence (proposed,
  pending owner confirmation).
- **v1 update (Oct 24, 2026):** `application` label added per owner approval
  (confirmations for manual + auto-applied applications; thread anchor for
  forgotten auto-applications); thread-history rule added for
  cold-outreach vs recruiter/new. Set is now eight labels.
