---
name: b4x
description: >
  B4X development patterns for B4A (Android), B4J (desktop/server), and B4i (iOS):
  the XUI cross-platform library, B4XPages framework, resumable subs / Wait For,
  SQLite, JSON, runtime permissions, custom views and b4xlib libraries. Use whenever
  writing, reviewing, refactoring, or reasoning about B4X code, .bas modules, b4xlib
  libraries, B4X Visual Designer layouts and Designer Scripts, or migrating older
  B4X syntax to current idioms. Trigger words: B4X, B4A, B4J, B4i, B4XPages,
  B4XView, XUI, xCustomListView, b4xlib, Wait For, resumable sub, Designer Script,
  Anchors, manifest editor, RuntimePermissions, HttpJob, JSONParser.
---

# B4X Development

B4X is a RAD toolset by Anywhere Software for building native apps from a shared
BASIC-like codebase across platforms. The whole value proposition is 70–95% code
reuse: write and debug in B4J, adapt for B4A and B4i.

**B4R (Arduino/ESP) is intentionally out of scope** for this skill. It has no B4XPages,
no XUI, different data types, tight memory constraints and a different runtime. Treat
B4R as a separate skill; do not apply B4XPages/XUI patterns to it.

## How to use this skill (read this first)

The detailed reference is split by topic so you only load what the task needs. Read the
relevant file(s) under `references/` before answering:

| Task involves…                                              | Read |
|-------------------------------------------------------------|------|
| Variables, types, scope, modules, control flow, strings, collections | `references/language-and-modules.md` |
| B4XPages lifecycle/API, XUI, B4XView/Canvas/Bitmap/Font, Designer, Anchors | `references/b4xpages-and-xui.md` |
| SQLite, ResultSet, files I/O, JSON parse/generate            | `references/data-and-io.md` |
| Sleep, Wait For, resumable subs, HttpJob, error handling     | `references/async-network.md` |
| Custom views (XUI), building a .b4xlib                        | `references/custom-views-and-libraries.md` |
| Android manifest, runtime permissions, JavaObject            | `references/platform-b4a.md` |
| B4J desktop UI, headless server, jServer handlers, packaging | `references/platform-b4j.md` |
| B4i UI, NativeObject, ATS, signing/build                     | `references/platform-b4i.md` |
| Deciding if an old snippet is still current, or whether a feature exists on the user's IDE version | `references/common-mistakes.md` |

`references/common-mistakes.md` is the highest-value file: it lists the concrete
errors LLMs make in B4X (VB/Java contamination, mixing B4A/B4J/B4i APIs,
uninitialized collections, the DB-copy ordering bug). Skim it before generating
non-trivial code.

## Quick rules (apply even without reading further)

1. **Target the right module type.** New standard UI projects use **B4XPages**, never
   legacy Activities. Process-global state lives in **`Main.Process_Globals`**
   (Main is a code module); per-page state lives in **`B4XMainPage.Class_Globals`**
   (a class module). You cannot put `Process_Globals` inside a class module.
   B4XPages also handles system-bar insets under the edge-to-edge enforcement that
   `targetSdkVersion 36` brings; Activity projects must do it per activity.
2. **Starter service:** don't add it to new B4XPages projects. It is not "removed" —
   older projects may still use it — but new B4XPages code doesn't need it, so declare
   shared objects in `Main.Process_Globals` and put `Application_Error` in Main.
3. **Cross-platform first.** Use `B4XView`, `B4XCanvas`, `xui.*`, `xCustomListView`,
   `B4XDialogs` for shared code. Reach for platform-specific views/APIs only behind
   `.As(...)` casts or `#If B4A/B4J/B4i` blocks.
4. **Prefer the Visual Designer** (layouts + Anchors + Designer Script `AutoScaleAll`)
   over building UI in code — **except** for dynamic content (list items, generated
   grids) and custom views, where code is correct. On B4A, remember that anchored
   layouts draw under the system bars at `targetSdkVersion 36` unless insets are
   handled — never suggest the old `windowOptOutEdgeToEdgeEnforcement` opt-out, which
   is disabled there.
5. **SQL:** parameterize data values with `ExecQuery2` / `ExecNonQuery2` and
   `Array As Object(...)`. Never concatenate untrusted input. Static DDL
   (`CREATE TABLE …`) has no data values and legitimately uses plain `ExecNonQuery`.
6. **Async:** every `Sleep`/`Wait For` makes a sub resumable. Use a Sender filter on
   `Wait For` to avoid event collisions. Always check `job.Success` and call
   `job.Release` on both success and failure paths.
7. **State assumptions.** When you output code, say which platform(s) it targets, which
   module it goes in, and which libraries must be checked.

## Compile checklist (run before returning any B4X code)

- [ ] Correct module type: `Process_Globals` only in code modules; `Class_Globals` in classes.
- [ ] Every object is initialized before use (`Map`, `List`, `SQL`, custom views…).
      Prefer `CreateMap(...)` or explicit `.Initialize`.
- [ ] Event handler signatures match exactly (`Sub Name_Event(args…)`), including
      the `Wait For` anonymous-event names.
- [ ] `ResultSet`, streams closed; `HttpJob.Release` called; transactions ended.
- [ ] Strings joined with `&`, comparisons with `=`/`<>`, no `++`/`+=`/`?:`/`==`.
- [ ] No VB/VB.NET or Java-only constructs (see `common-mistakes.md`).
- [ ] Each example labelled `' B4X`, `' B4A only`, `' B4J only`, `' B4i only`, or
      wrapped in `#If`.
- [ ] Any "current/latest" version claim was checked against b4x.com, not memory.
