# Changelog

All notable changes to this skill are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project
follows [Semantic Versioning](https://semver.org/).

Because this is a knowledge skill rather than an API, versions are read as:

- **MAJOR** — guidance reverses, or the skill's scope changes. Advice you
  followed on the previous version may no longer be what the skill recommends.
- **MINOR** — new coverage, new checks, or newly documented patterns. Existing
  guidance still holds.
- **PATCH** — corrections, clarifications, and wording. No new coverage.

Reorganising files inside `references/` is not a breaking change: the skill's
interface is what it tells you about B4X, not how its own files are arranged.

## [Unreleased]

## [1.7.0] — 2026-08-15

The last open audit finding: nothing checked what the skill *says*. Every serious
defect so far passed the structural validator.

### Added

- `evals/content-checks.mjs`, run in CI after the validator. Enforces platform
  purity — no code block labelled `' B4X` may name a single-platform type, with
  `#If B4A … #End If` exempt, since that guard is how shared code is supposed to
  reach a platform API. It would have caught the `CSBuilder` and `ThrowException`
  mislabels.
- Eleven regression assertions in the same file, one per bug that has shipped,
  each tagged with the version that fixed it and the reason it matters. Verified
  by reintroducing three of the original defects, each of which failed the run.
- `evals/cases.md`: eight behavioural cases graded by reading rather than string
  matching, since asserting exact output would only teach one phrasing. Each
  descends from a real defect. Case 8 asks directly for a member that does not
  exist, which is the failure mode the skill exists to prevent.
- `evals/README.md` on why there are two layers and when to run each, including
  that API resolution needs a local B4X install and reports itself skipped rather
  than passing quietly.

### Changed

- The validator's README check now accepts any `.md` that exists anywhere in the
  repo, not only under `references/`, so documentation outside the skill does not
  register as a stale reference.

## [1.6.0] — 2026-08-15

Acts on an external audit. Every finding below was re-verified against the
installed libraries or the official sources before being acted on.

**If you copied shared code from 1.5.0, re-check it**: three fixes here reclassify
code that was presented as cross-platform but is not.

### Fixed

- **A B4J server sharing one `SQL` object across multithreaded handlers.** The
  third argument of `AddHandler` is *"whether this handler should always run in
  the main thread"*, so the `False` in `platform-b4j.md` meant worker threads,
  while `data-and-io.md` said to keep the database in `Main.Process_Globals`.
  Neither file was wrong alone; together they produced concurrent use of a single
  connection, which corrupts behaviour with no compile error. `platform-b4j.md`
  now uses `ConnectionPool` with a connection taken and closed per request and
  documents both values of the flag, and `data-and-io.md` carries the exception
  to its own rule.
- **`CSBuilder` presented as cross-platform.** The type does not exist in B4J —
  swapping `Typeface` for the XUI font factories makes the font portable, not
  `CSBuilder`. Relabelled B4A/B4i, with `BCTextEngine` / `BBLabel` named for B4J.
- **`ThrowException` and `Exception.StackTrace` labelled `' B4X`.** Both are B4A
  Core additions and absent from B4J; the block even contradicted itself with an
  inline "B4A 13.7+" note. Split into a genuinely cross-platform
  `Try`/`Catch`/`LastException.Message` example and a B4A-only one, with the
  `#If B4A` form for shared code.
- **B4i orientation attribute.** `#SupportedOrientations: 2` is B4A's form.
  B4i uses `#iPhoneOrientations` and `#iPadOrientations` with named values.
- **Google Play tense.** The API 36 requirement was written as already in force;
  31 August 2026 is still ahead. Now stated as a future date, with the per-device
  thresholds and the extension to 1 November 2026.
- **`#Region` described as setting the B4J app type.** It only folds a block in
  the editor; the type comes from creating a Non-UI project.
- **Pseudo-code in a copyable block.** `req.InputStream ...` is now a working
  `TextReader.Initialize2` read of the request body.
- `AddPageAndCreate` was described as constructing the page. Both it and
  `AddPage` take an instance you already initialized; they differ in when
  `B4XPage_Created` runs.
- README credited "Working Style guidance" for a section that does not exist.

### Added

- Threading section in `platform-b4j.md`: what each value of the `AddHandler`
  flag means and which database access each one permits.
- B4J 10.2 and B4i 8.90 floors alongside B4A 13.3 for `Initialized()` and the
  B4XCollections helpers, with the rule that shared code takes the highest of the
  three.
- A caveat in `bundled-libraries.md` that the list was checked against a B4A
  install and availability is per platform and per IDE version.

### Changed

- Softened rules the skill's own section on over-absolute guidance contradicted:
  "Always add the Sender filter" is now driven by collision risk, B4XPages is the
  default rather than "mandatory", and the unsourced "roughly 80% of B4X UI"
  quantification is gone.

## [1.5.0] — 2026-08-10

Reported from practice: generated projects kept failing to compile because a
variable, a Sub and a module had ended up with the same name.

### Added

- `Naming and collisions` in `language-and-modules.md`. Identifiers are
  case-insensitive, so names that coexist happily in Java or C# collide in B4X.
  Tabulates what shares a namespace: a Sub and a variable in one module; a Sub
  parameter and a global, which fails with *"Parameter name cannot hide global
  variable name"*; anything and a module name, since modules are qualifiers;
  a Designer view and anything else in its module, because `LoadLayout` binds
  views to same-named variables; and anything named after a library type. Notes
  the `m` prefix for module-level state that Erel's own library sources use.
- Section 13 of `common-mistakes.md` for the same trap, with the point that
  matters when generating: pick names against the set already in use across the
  module and project, not per sub. Choosing a name in isolation is what produces
  the collision.
- A name-collision line in the `SKILL.md` compile checklist, which is where it
  gets checked before code is handed over.

## [1.4.0] — 2026-08-09

Closes the gap between this skill and Erel's own recommendations, and gives the
skill a way to know what already exists before it invents something.

### Added

- `references/bundled-libraries.md`. The skill previously documented only the
  libraries that are architecturally load-bearing or universally needed, so a
  whole tier of things that ship with the IDE — `B4XTable`, `KeyValueStore`,
  `Xml2Map`, `MediaChooser`, `NB6`, `B4XDrawer`, `PreoptimizedCLV` and the rest —
  was invisible. The file is organised for recall rather than reference: what
  exists and what it is for, deliberately without signatures, which is the part
  that goes stale.
- `ListOfArrays` (LoA) covered in that file: tabular data in memory instead of a
  `List` of `Map`s or parallel arrays, with its `LOAUtils` entry points. It was
  released in May 2026, so no model has seen it — without the skill it will never
  be suggested. For the same reason it carries an explicit instruction not to
  write LoA code from memory: it was pre-1.0 at the time of writing and has
  roughly 70 public subs, which is an invitation to confabulate the rest.
- Section 13 of `common-mistakes.md`, covering the items from Erel's "Code
  Smells" and "Features to avoid" that the skill did not have:
  `GetKeyAt`/`GetValueAt`, `File.DirDefaultExternal`, `File.DirRootExternal`,
  `Round2` used for display, `VideoView`, `BytesToString` on non-text bytes,
  `ExecQuerySingleResult` with a possibly-absent row, `TextReader`/`TextWriter`,
  hand-built XML and JSON, and initialise-then-reassign. Plus repetition,
  redundant boolean returns and needless globals.
- A closing note in `bundled-libraries.md` on how to check an API without
  inventing one, including that a Subs-only listing cannot see a `Public`
  variable in `Process_Globals` — the mistake made in 1.3.0.

## [1.3.1] — 2026-08-09

### Fixed

- **Reverses the main claim of 1.3.0: `B4XPages.HandleInsets` does exist.** It is
  declared in `B4XPages.bas` as `Public HandleInsets as Boolean = True` in
  `Process_Globals`, and `B4XPagesManager.bas` reads it inside `#If B4A` to
  choose between `ime.GetContentRect` and `0, 0, 100%x, 100%y`. The 1.2.0
  guidance was correct and 1.3.0 wrongly removed it.

  The bad verification: the library-doc tooling lists a `.b4xlib` module's
  **Subs**, and a name search covers types, methods, properties and events. A
  public variable in `Process_Globals` appears in none of those, so two searches
  returning nothing was taken as proof of absence when it only meant the searches
  could not see that kind of member. For `.b4xlib` libraries, read the extracted
  source before concluding an API does not exist.

- Restored with detail neither previous version had: the default is `True`, and
  the flag only affects B4A, since the branch reading it is inside `#If B4A`.

## [1.3.0] — 2026-08-09

B4A 13.7 was released as stable. Its edge-to-edge API was verified against the
installed libraries rather than forum posts, which corrected the guidance 1.2.0
shipped.

### Fixed

- **`B4XPages.HandleInsets` does not exist.** 1.2.0 documented it in
  `platform-b4a.md` and `b4xpages-and-xui.md` as the way to disable inset
  handling for full-screen apps. It is absent from the public API of both
  B4XPages modules and from every installed library. It came from a summary of a
  beta announcement thread and was written up without being checked against the
  library — precisely the fabricated-API failure this skill exists to prevent.
  Removed.
- The Activity root-panel pattern was missing its point: the layout must be
  loaded into the root panel (`root.LoadLayout(...)`), not into the Activity.
- The version-gated table named the wrong API for inset handling.

### Added

- Verified IME members for edge-to-edge work in `platform-b4a.md`:
  `GetContentRect`, `IsEdgeToEdge`, `GetActionBarHeight`, `AddHeightChangedEvent`
  with the `InsetsChanged` event, and `UpdatePercentageReference` for layouts
  using `%x` / `%y` inside a root panel smaller than the screen.
- `Errors` section in `language-and-modules.md`. `Catch` takes no parameter and
  the exception is read from `LastException`; this was only visible in a table
  row and one example before.
- `ThrowException(Message)` and `Exception.StackTrace`, both Core members added
  in B4A 13.7, with their pre-13.7 fallbacks.

### Changed

- Inset support is now recorded with the component versions it needs — B4A 13.7,
  IME 2.01, B4XPages 1.15 — since B4XPages depends on IME on B4A to do it.

## [1.2.0] — 2026-08-03

Covers the edge-to-edge enforcement that arrives with `targetSdkVersion 36`,
which Google Play has required for new apps and updates since 31 August 2026.

### Added

- Edge-to-edge section in `platform-b4a.md`: at targetSdk 36 the app draws under
  the system bars with no opt-out. B4XPages handles insets from B4A 13.7;
  Activity projects need `ime.GetContentRect` in every activity. Covers
  `B4XPages.HandleInsets`, `#EdgeToEdgeOldDevices`, and the
  `enableOnBackInvokedCallback` default.
- `common-mistakes.md` gains the `windowOptOutEdgeToEdgeEnforcement` trap. The
  attribute is disabled at targetSdk 36 and fails silently — no error, no log,
  the layout just breaks — yet it is what the targetSdk 35 era material still
  recommends, so it is easy to reproduce from memory. Includes the detail that
  it still works on Android 15 devices, so testing can hide the problem.
- Inset handling added to the version-gated table as B4A 13.7+.
- `b4xpages-and-xui.md` notes that B4XPages needed no layout changes for
  targetSdk 36, and documents `B4XPages.HandleInsets`.
- `scripts/validate.mjs` fails if `skills/` contains a skill it does not cover.
  Its checks are hardcoded to one skill, so a second one would have been ignored
  while the run still reported success — health it never measured.

### Changed

- Quick rule 1 in `SKILL.md` now cites inset handling, which is a far more
  concrete argument for B4XPages than lifecycle convenience: a B4XPages project
  needed no changes for targetSdk 36, an Activity project needs work per screen.
- Quick rule 4 warns that anchored Designer layouts draw under the system bars at
  targetSdk 36. The skill was recommending the Designer-plus-Anchors approach
  that the change breaks, without mentioning the change.

### Fixed

- `platform-b4a.md` listed `#TargetSdkVersion` as a project attribute in Main.
  B4A sets `minSdkVersion` and `targetSdkVersion` in the Manifest Editor, so the
  generated line did nothing. Project attributes and the Manifest Editor are now
  presented as the separate places they are, with the correct `AddManifestText`
  form. The stated value 34 was also below both current Play thresholds.

## [1.1.0] — 2026-07-30

### Added

- Version-gated feature table in `common-mistakes.md`: which B4X idioms require
  which IDE version, and what to write instead on older ones. Covers
  `Initialized()`/`NotInitialized()`, the B4XCollections helpers, `#Macro`,
  `List.SubList`, Starter-service omission, `WebView.AllowFileAccess`,
  `#CustomBuildAction` variables, and B4XPages itself.
- Note in `common-mistakes.md` that the `Robocopy` Shared-Files trick is
  Windows-only.
- Compile-time versus runtime platform branching in `b4xpages-and-xui.md`:
  `#If B4A` excludes code from compilation, `xui.IsB4A` does not, so runtime
  checks cannot guard platform-specific types.
- `scripts/validate.mjs` and a GitHub Actions workflow: validates `SKILL.md`
  frontmatter against the Agent Skills specification, checks that routing
  between `SKILL.md` and `references/` resolves in both directions, that
  cross-file mentions exist, that the plugin and marketplace manifests are
  well-formed, and that the README reference list matches the files on disk.

### Changed

- Version requirements now sit next to the features they gate in
  `language-and-modules.md`, instead of in a separate file the agent only opened
  once a version problem was already suspected.

### Fixed

- The pre-13.3 fallback for `Initialized()` was given as
  `If m.IsInitialized Then`, which throws on a `Null` reference. Corrected to
  `If m <> Null And m.IsInitialized Then`.
- The Starter-service guidance now states the precondition it depends on:
  removing Starter stopped affecting unhandled-exception behaviour in B4A 13.5,
  which is what makes `Application_Error` in `Main` valid.
- README credited a "Working Style" section of `SKILL.md` that does not exist.
- Removed the "Anthropic-external" framing from the skill introduction.

### Removed

- `references/compatibility.md`. It mixed permanent facts (a feature's minimum
  version) with facts that expire within months (the current release) and
  release-note detail that never changed generated code. The permanent parts
  moved to `common-mistakes.md` and `language-and-modules.md`; the rest is gone,
  because a skill should not carry version claims that quietly go stale.

## [1.0.0] — 2026-07-27

### Added

- Initial release: `SKILL.md` routing table, quick rules, and compile checklist.
- Reference files covering the B4X language and modules, B4XPages and XUI,
  SQLite/files/JSON, resumable subs and networking, custom views and `.b4xlib`
  packaging, the B4A/B4J/B4i platform specifics, and common AI-generated
  mistakes.
- Claude Code plugin and marketplace manifests.

[Unreleased]: https://github.com/Jerryk133/b4x-skill/compare/v1.7.0...HEAD
[1.7.0]: https://github.com/Jerryk133/b4x-skill/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/Jerryk133/b4x-skill/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/Jerryk133/b4x-skill/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/Jerryk133/b4x-skill/compare/v1.3.1...v1.4.0
[1.3.1]: https://github.com/Jerryk133/b4x-skill/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/Jerryk133/b4x-skill/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/Jerryk133/b4x-skill/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/Jerryk133/b4x-skill/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Jerryk133/b4x-skill/releases/tag/v1.0.0
