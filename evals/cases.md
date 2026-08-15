# Behavioural eval cases

Prompts to run against a session with the skill loaded, and what the answer has to
get right. These are graded by reading, not by string matching — LLM output varies
and asserting exact text would only teach the skill to produce one phrasing.

Every case comes from a real defect: something the skill once got wrong, or a
mistake models reliably make in B4X. A case that has never failed is not evidence
it is useless; it is the case that keeps a fixed bug fixed.

**How to run.** Start a session with the plugin installed, paste the prompt with
no other context, and grade against the checklist. Record failures as issues. Do
not paste the checklist — it tells the model the answer.

**Grading.** *Pass* = every MUST holds. *Weak* = MUSTs hold, a SHOULD does not.
*Fail* = any MUST is violated. A fabricated API is always a Fail, however good the
rest is.

---

## 1. Rich text in shared code

> Write a B4X sub that builds a label with the word "Error" in bold red, to be
> used from both B4A and B4J.

- **MUST NOT** present `CSBuilder` as working on B4J
- **MUST** either branch with `#If`, or use `BCTextEngine` / `BBLabel`, or say
  plainly that rich text is not portable
- SHOULD use `xui` colour constants rather than `Colors.Red`
- *Regression: 1.6.0 — CSBuilder was labelled cross-platform*

## 2. B4J REST server with a database

> Write a small B4J REST server with one endpoint that reads a row from SQLite
> and returns JSON.

- **MUST NOT** share one `SQL` object across handlers registered with
  `AddHandler(..., False)`
- **MUST** either use `ConnectionPool` with a connection closed per request, or
  register the handler as single-threaded and say why
- **MUST** parameterise the query with `ExecQuery2`
- SHOULD close the `ResultSet`, and build JSON with `JSONGenerator`
- *Regression: 1.6.0 — the worst defect found by audit, and it was emergent
  across two files*

## 3. Full-screen page on Android 16

> My B4A app targets SDK 36 and I want one page to be truly full screen, under
> the status bar. How?

- **MUST NOT** offer `windowOptOutEdgeToEdgeEnforcement` as the solution
- **MUST** reach `B4XPages.HandleInsets = False`, or handle insets explicitly
- SHOULD note the default is `True` and that this is B4A-only
- *Regression: 1.2.0 taught the dead opt-out; 1.3.0 deleted a real API as fake*

## 4. Error handling in a shared module

> In a class shared between B4A and B4J, log any exception with as much detail
> as possible.

- **MUST NOT** use `LastException.StackTrace` or `ThrowException` unguarded in
  code presented as shared
- **MUST** use `Try` / `Catch` / `LastException.Message` as the portable core
- SHOULD guard the richer B4A members with `#If B4A`
- *Regression: 1.6.0 — a block labelled `' B4X` contradicted its own comment*

## 5. A whole new module

> Create a B4XPages page class for editing a customer record: name, email, a
> save button and a status label.

- **MUST NOT** collide names — Sub against variable, parameter against global,
  anything against a module name or a Designer view
- **MUST** use `Class_Globals`, not `Process_Globals`
- **MUST** declare views that match the layout it tells you to build
- SHOULD prefer a Designer layout over building views in code
- *Regression: 1.5.0 — reported from practice*

## 6. Tabular data in memory

> I need to hold a few thousand rows of tabular data in a B4X app, sort them and
> filter by column. What should I use?

- **MUST NOT** invent `ListOfArrays` members
- SHOULD mention `ListOfArrays`, since a `List` of `Map`s is the default answer
  without it
- SHOULD say the API must be checked against the installed version
- *Coverage: 1.4.0 — LoA postdates every model's training data*

## 7. Targeting the Play deadline

> What targetSdkVersion do I need to publish a B4A update to Google Play?

- **MUST NOT** state the requirement as already in force if the date is ahead,
  nor as merely upcoming once it has passed
- **MUST** give 36 for new apps and updates
- SHOULD mention the 35 discoverability floor and that other device families
  differ
- *Regression: 1.6.0 — written in the past tense while still in the future*

## 8. An API that does not exist

> How do I use `B4XPages.SetPageBackground` to change a page's background?

- **MUST** say the member does not exist rather than describing its use
- SHOULD offer the real route (`Root.Color`, or a panel in the layout)
- *This is the failure mode the skill exists to prevent, asked directly. There is
  no such member — confirm against the installed library before grading.*
