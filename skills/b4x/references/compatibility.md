# Version & Compatibility

> **All version numbers below are a snapshot to verify, not authoritative.** B4X releases
> frequently. Before making any "current / latest / supported" claim, check the official
> changelogs at **b4x.com**. Feature-availability notes marked *(verify)* are drawn from
> the original skill and could not be independently confirmed.

## Snapshot (as reviewed July 2026 — reconfirm before relying on it)

| Tool | First B4XPages support | Version noted as current |
|------|------------------------|--------------------------|
| B4A  | v10.0 | v13.5 |
| B4i  | v6.80 | v10.0 |
| B4J  | v8.50 | v10.5 |
| B4R  | — (no B4XPages/XUI) | v4.00 — out of scope for this skill |

These three current numbers (B4A 13.5, B4J 10.5, B4i 10.0) were broadly plausible as of
mid-2026, but treat them as needing reconfirmation.

## Feature milestones *(verify against b4x.com)*

- **B4A v13.0 (2024)** — SDK updated for Android 14 (`targetSdkVersion 34`); newer Java
  requirement. *(verify)*
- **v13.1 (2025)** — `WebView.AllowFileAccess`; more `#CustomBuildAction` variables.
  *(verify)*
- **v13.3 (2025)** — `Initialized` / `NotInitialized` keywords; expanded B4XCollections
  helpers (`EmptyList`, `EmptyMap`, `CreateList`, `MergeLists`, `MergeMaps`,
  `CopyOnWriteList`, `CopyOnWriteMap`). *(verify — confirm exact helper signatures before
  using them in generated code; the safe list idiom is `Dim l As List : l.Initialize :
  l.AddAll(...)`.)*
- **v13.4 (2025)** — new command-line tools / prepackaged SDK. *(verify)*
- **v13.5 (2026)** — integrated code bundle; Starter service de-emphasized in favour of
  B4XPages-native init; `Application_Error` usable directly in Main; `List.SubList` fast
  read-only sublist. *(verify)*

## Cross-platform notes that don't change per version

- `#If B4A / B4i / B4J … #End If` for compile-time platform branching.
- `xui.IsB4A / IsB4i / IsB4J` for runtime platform branching.
- `#CustomBuildAction` with `Robocopy` (the common Shared-Files copy trick) is
  **Windows-only**; macOS/Linux users need an equivalent shell copy step.
