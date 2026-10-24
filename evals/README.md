# Evals — the golden dataset is the contract

## What lives here (and what doesn't)

- `evals/data/` (gitignored, intentionally absent from this repo) holds the
  real golden set: ~150 labeled messages, split by thread into a ~100-message
  dev set and a ~50-message locked test set.
- The public repo carries **no real emails**. The annotation guide and this
  methodology are the public artifacts; the data stays local.

## Rules

1. **Guide first.** No labeling starts until `docs/annotation-guide.md` is
   approved. New edge cases update the guide (with a changelog entry) before
   they update the data.
2. **Stratified sampling.** Sample across all eight labels, across time, and
   deliberately include hard cases. A random sample would be mostly promos and
   teach the classifier that everything is promos.
3. **Two passes + adjudication.** The owner labels as domain expert; a second
   labeler does a blind pass on a subset. Disagreements are adjudicated and
   written back into the guide.
4. **Dev/test discipline.** The locked test set is scored only for final
   evaluation. No tuning against it, no peeking.
5. **Versioning.** Dataset versions carry a changelog: what was added, what
   was relabeled, and why.
6. **Failure-driven growth.** Every classifier miss goes back into the golden
   set. Eval → fail → fix → re-eval.

## Metrics (Week 2–3)

Precision/recall per category, priority-ranking agreement, draft-acceptance
rate, latency + token cost per message. The rules-only baseline is scored
BEFORE the LLM version so the write-up shows the actual delta.
