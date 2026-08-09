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

[Unreleased]: https://github.com/Jerryk133/b4x-skill/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/Jerryk133/b4x-skill/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/Jerryk133/b4x-skill/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/Jerryk133/b4x-skill/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Jerryk133/b4x-skill/releases/tag/v1.0.0
