# Evals

`scripts/validate.mjs` checks the plumbing: routing, links, frontmatter, packaging.
It cannot tell you that something the skill says is wrong. Everything serious that
has gone wrong here passed it — a fabricated API, a type presented as
cross-platform that only exists on one platform, a database rule that was correct
in isolation and a bug in combination.

These evals check what the skill says. Two layers, because they cost very
different amounts to run.

## Layer 1 — `content-checks.mjs`

Deterministic, no model, no network. Runs in CI next to the validator.

```bash
node evals/content-checks.mjs
```

**Platform purity.** No code block labelled `' B4X` may name a type that exists on
only one platform. Code inside `#If B4A … #End If` is exempt — that guard is
precisely how shared code is meant to reach a platform API. This is the check that
would have caught the `CSBuilder` and `ThrowException` mislabels.

**Regression checks.** One assertion per bug that has shipped, each tagged with the
version that fixed it and why it matters. Deleting one of these deletes the only
thing standing between the skill and that bug returning. Add a case here whenever
a defect is fixed.

**API resolution.** Reports what it can see. This is the only layer that could
catch an invented member, and it needs a local B4X installation, so it is skipped
in CI — and says so rather than passing quietly. Identifier-level resolution is
not automated yet; today it prints a reminder that for a `.b4xlib` you must read
the shipped source, because a Subs-only listing cannot see a `Public` variable in
`Process_Globals`. That specific blind spot once produced a wrong "this API does
not exist" conclusion.

## Layer 2 — `cases.md`

Prompts run against a real session with the skill loaded, graded by reading. These
catch what no static check can: whether the skill actually changes the answer.

They need a human, a model and a few minutes, so they are not in CI. Run them
before a release that touches guidance, and whenever a case's subject area
changes.

Each case states MUSTs and SHOULDs and names the defect it descends from. Do not
paste the checklist into the session — it hands over the answer.

## Adding to these

When a defect is found:

1. Fix it.
2. Add a regression check to `content-checks.mjs` if the fix is visible in the
   text — a phrase that must appear, or one that must not.
3. Add a case to `cases.md` if the defect is about what the skill *produces*
   rather than what it *says*.

The second step is cheap and permanent. The first without it means the same bug
can come back in six months with nothing to notice.
