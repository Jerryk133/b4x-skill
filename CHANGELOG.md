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

### Added

- `scripts/validate.mjs` now fails if `skills/` contains a skill it does not
  cover. Its checks are hardcoded to one skill, so a second one would have been
  ignored while the run still reported success — health it never measured. The
  guard forces the script to be generalised at that point instead.

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

[Unreleased]: https://github.com/Jerryk133/b4x-skill/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/Jerryk133/b4x-skill/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Jerryk133/b4x-skill/releases/tag/v1.0.0
