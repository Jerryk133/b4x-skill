# Common Mistakes (read before generating non-trivial B4X)

This is the highest-value file in the skill. It targets the specific ways LLMs (and old
web snippets) go wrong in B4X.

## 1. B4X is not VB / VB.NET / Java

B4X *looks* BASIC-like, which pulls generation toward VB and Java. It is neither.

| Wrong (VB/Java habit) | Correct B4X |
|-----------------------|-------------|
| `Dim x = 5` | `Dim x As Int = 5` (type required) |
| `"a" + "b"` | `"a" & "b"` |
| `Function F() As Int … End Function` | `Sub F As Int … End Sub` |
| `ElseIf` / `EndIf` | `Else If` / `End If` (two words) |
| `if (x == 1)` | `If x = 1 Then` |
| `x != y` | `x <> y` |
| `i++` / `i += 1` | `i = i + 1` |
| `cond ? a : b` | `IIf(cond, a, b)` (evaluates **both** branches) |
| `!flag` | `Not(flag)` |
| `catch (Exception e)` | `Catch` … then read `LastException` |
| `null` | `Null` (capital N) |
| `switch/case` fallthrough | `Select`/`Case`, no fallthrough |

Also: identifiers are **case-insensitive**; arrays are **zero-based**; there is no
operator overloading and no ternary.

## 2. Mixing B4A / B4J / B4i APIs in "cross-platform" code

The most damaging class of error. These are **platform-specific** and must be behind
`#If` or `.As(...)`, never presented as shared XUI:

| Symbol | Platform | Shared alternative |
|--------|----------|--------------------|
| `Activity`, `Panel`, `ImageView`, `EditText`, `ListView`, `Cursor`, `Typeface.*`, `android.*` | B4A | `B4XView`, `xCustomListView`, `ResultSet`, `xui.CreateFontAwesome`, `JavaObject` in `#If B4A` |
| `Pane`, `Node`, `fx.*`, `Form`, `setMouseTransparent`, `Server`/`ServletRequest` | B4J | `B4XView`, and keep server code B4J-only |
| `NativeObject`, `UIColor`, `NSLocale` | B4i | `B4XView`, `xui` helpers in `#If B4i` |

Rule of thumb: if a symbol names a concrete Android/JavaFX/UIKit class, it isn't shared.

## 3. Uninitialized objects

`Dim m As Map` / `Dim l As List` / `Dim sql As SQL` are **not** ready to use. Initialize
first, or use a factory:

```b4x
' B4X — wrong: crashes
Dim settings As Map
settings.Put("k", "v")

' B4X — right
Dim settings As Map = CreateMap("k": "v")     ' or: settings.Initialize
```

Types declared with `Type ...` also need `.Initialize` on each instance.

## 4. The prepared-DB copy ordering bug

`Initialize(..., True)` creates an empty file, so a later `File.Exists` is True and your
`DirAssets` DB is never copied. **Copy first, then `Initialize(..., False)`** — see
`data-and-io.md`.

## 5. Wrong module block

`Process_Globals` only exists in **code modules** (`Main`, code modules, services).
**Class modules — including every B4XPage/B4XMainPage — use `Class_Globals`.** Writing
`Sub Process_Globals` in `B4XMainPage` doesn't compile. Process-wide singletons →
`Main.Process_Globals`; page state → the page's `Class_Globals`.

## 6. Async hygiene

- Missing Sender filter on `Wait For` → events resume the wrong sub. Use
  `Wait For (senderObj) Event(...)`.
- Not checking `job.Success` → crashes on network failure.
- Not calling `job.Release` (or not on the failure path) → leaked connections.
- Forgetting `rs.Close` on a `ResultSet`.
- Expecting a return value from `CallSubDelayed` — it has none; use a `ResumableSub`
  + `Wait For` instead.

## 7. Building UI in code when a layout belongs in the Designer

Default to Visual Designer layouts + Anchors + `AutoScaleAll`. Generating static screens
in code is a B4X anti-pattern. Code-built views are correct **only** for dynamic content
(list rows, generated grids) and custom views.

## 8. Smart-string number formatting

Correct: `$"...$0.2{value}..."$` (min-int-digits `.` max-fraction-digits, then `{expr}`).
The `${0.2}(value)` form is not valid B4X.

## 9. SQL details

- Parameterize **values** with `ExecQuery2`/`ExecNonQuery2` + `Array As Object(...)`
  (numbers as numbers, not `Array As String`).
- List INSERT columns explicitly; don't rely on `VALUES(...)` positional order.
- Static DDL (`CREATE TABLE …`) legitimately uses plain `ExecNonQuery` — the parameterize
  rule is about **untrusted data values**, not a ban on the method.

## 10. Over-absolute "always/never" rules

Nuance the mechanical rules:
- "Never Starter" → *don't add it to new B4XPages projects*; legacy projects may keep it.
- "Always parameterize" → *for data values*; DDL is fine plain.
- "Always Designer" → *except* dynamic UI and custom views.
- `xui.DefaultFolder` is **not** a universal replacement for `DirCache`/`DirTemp` or
  user-facing storage — those have distinct purposes.
- `B4XView.Text`/`NumberOfViews` etc. aren't meaningful for every underlying view type.

## 11. Using a feature the user's IDE doesn't have

Generating a newer idiom for an older IDE is a compile error like any other. These are
the version-gated things worth knowing; the floor versions are fixed historical facts.

| Feature | Needs | Fallback on older IDEs |
|---------|-------|------------------------|
| `Initialized()` / `NotInitialized()` | B4A 13.3+ / **B4J 10.2+ / B4i 8.90+** | `If m <> Null And m.IsInitialized Then` |
| B4XCollections helpers (`CreateList`, `EmptyList`, `EmptyMap`, `MergeLists`, `MergeMaps`, `CopyOnWriteList`, `CopyOnWriteMap`) internal | B4A 13.3+ / **B4J 10.2+ / B4i 8.90+** | add the B4XCollections library manually, or `Dim l As List : l.Initialize : l.AddAll(...)` |
| `#Macro` attribute | B4A 13.3+ | — |
| `List.SubList` | B4A 13.5+ | copy into a new list |
| Omitting the Starter service **without changing unhandled-exception behaviour**, `Application_Error` in Main | B4A 13.5+ | keep the Starter service and put `Application_Error` there |
| `WebView.AllowFileAccess` | B4A 13.1+ | — |
| `#CustomBuildAction` vars (`%PROJECT%`, `%B4X%`, `%JAVABIN%`, `%PROJECT_NAME%`, `%ADDITIONAL%`) | B4A 13.1+ | hardcode the paths |
| Edge-to-edge inset handling (`IME.GetContentRect`, `IME.IsEdgeToEdge`, `IME.InsetsChanged`, `B4XPages.HandleInsets`, `#EdgeToEdgeOldDevices`) | B4A 13.7+ (IME 2.01, B4XPages 1.15) | none — targetSdk 36 needs 13.7; older IDEs can only stay at targetSdk 35 |
| `ThrowException(Message)`, `Exception.StackTrace` | B4A 13.7+ | raise via a runtime error; log `LastException` without the trace |
| `targetSdkVersion 34` toolchain (needs Java 19) | B4A 13.0+ | — |
| **B4XPages itself** | B4A 10.0 / B4J 8.50 / B4i 6.80 | legacy Activities (B4A) — but recommend upgrading instead |

**In shared code the floor is the highest of the three**, not B4A's. A feature that
arrived in all three IDEs at once still needs each platform's own version number, because
a project can sit on an older B4J or B4i while B4A is current.

When the target version is unknown and a gated feature would materially change the
answer, ask — or generate the fallback, which compiles everywhere.

**Never state a "current / latest" version from memory.** B4X ships frequent incremental
updates and any number in this skill's own history has already been wrong once. Check
b4x.com.

## 12. The edge-to-edge opt-out that silently does nothing

There is a large body of forum and blog material from the `targetSdkVersion 35` era
recommending this to switch edge-to-edge off:

```xml
<!-- Obsolete at targetSdkVersion 36 — do not generate this as the fix -->
<item name="android:windowOptOutEdgeToEdgeEnforcement">true</item>
```

At `targetSdkVersion 36` the attribute is deprecated and **disabled**. It throws no
error and logs nothing; the app simply goes edge-to-edge anyway and content draws under
the system bars. Because Play requires targetSdk 36, this recipe is now a trap rather
than a solution, and it is exactly the kind of stale snippet that gets reproduced from
memory.

Two details that make it worse:

- A targetSdk 36 app **still honours the opt-out on an Android 15 device**, so it can
  look like it works in testing and fail on Android 16.
- The original recipe also required removing any existing
  `CreateResourceFromFile(Macro, Themes.LightTheme)` line, since the custom theme
  replaces it. Copies of the snippet usually drop that part.

Handle insets instead — see `platform-b4a.md`.

## 13. Name collisions, because identifiers are case-insensitive

A frequent failure in generated projects: a variable, a Sub and a module end up with the
same name. `Count` and `count` are one identifier in B4X, so names that would coexist in
Java or C# collide, and it surfaces as a compile error far from where the name was chosen.

Check before naming: a Sub and a variable in one module, a Sub parameter and a global
(*"Parameter name cannot hide global variable name"*), anything and a **module** name, a
Designer view and anything else in its module, and anything named after a library type
(`Dim List As List`). See `language-and-modules.md` for the full table and the `m` prefix
convention for module-level state.

When generating a whole module or project, pick names against the set already in use
rather than per sub — that is where this error comes from.

## 14. Idioms the B4X author recommends against

These come from Erel's own "Code Smells" and "Features to avoid" lists. They compile, so
nothing flags them — they are just not how B4X is written now.

| Instead of | Write |
|------------|-------|
| `map.GetKeyAt(i)` / `map.GetValueAt(i)` | `For Each k As String In map.Keys` |
| `File.DirDefaultExternal` | `xui.DefaultFolder` |
| `File.DirRootExternal` | `ContentChooser` (Phone library) or a save-as flow |
| `Round2(n)` to format a number for display | `NumberFormat` / `NumberFormat2`, or `B4XFormatter` for per-range rules |
| `VideoView` | `ExoPlayer` |
| `BytesToString` on bytes that are not text | `B4XBytesBuilder` (in B4XCollections) |
| `ExecQuerySingleResult` where there may be no row | `ExecQuery2`, then check `rs.NextRow` |
| `TextReader` / `TextWriter` over a network | `AsyncStreams` |
| `TextReader` / `TextWriter` over files | `File.ReadString`, `File.ReadList` |
| Building XML or JSON by concatenating strings | `JSONGenerator`, `XMLBuilder`, `Map2Xml` |
| Initializing an object and then assigning a different one to the same variable | assign directly |

`Round2` deserves the note: it rounds a `Double`, which is a numeric operation. Most uses
of it are really formatting for display, and that is a different job.

Three more that are about shape rather than API:

- **Repeated near-identical blocks.** Put the varying parts in a collection and loop.
- **`If cond Then Return True Else Return False`.** Return the expression.
- **Globals used by one sub.** Declare locally; module scope is for shared state.

## 15. Presenting a Windows-only build step as universal

The common Shared-Files copy trick — `#CustomBuildAction` invoking `Robocopy` — is
**Windows-only**. B4J and B4i developers on macOS or Linux need an equivalent shell copy
(`cp -R`, `rsync`). Don't emit the Robocopy form without saying so.
