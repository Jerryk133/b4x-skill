#!/usr/bin/env node
// Content checks for the b4x skill. No dependencies; `node evals/content-checks.mjs`.
//
// scripts/validate.mjs checks the plumbing — routing, links, packaging. This
// checks what the skill actually says. Three layers:
//
//   1. Platform purity  — no block labelled ' B4X may name a platform-specific type
//   2. Regressions      — one assertion per bug that has been fixed, so it stays fixed
//   3. API resolution   — identifiers resolve against the installed B4X libraries
//
// Layer 3 needs B4X installed and is skipped elsewhere, CI included. It is the
// only layer that can catch an invented API, so run this locally before a release.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REF = join(ROOT, "skills", "b4x", "references");
const SKILL = join(ROOT, "skills", "b4x", "SKILL.md");

const failures = [];
const notes = [];
const read = (p) => readFileSync(p, "utf8");
const refFile = (n) => read(join(REF, n));
const allRefs = () => readdirSync(REF).filter((f) => f.endsWith(".md"));

function check(name, condition, detail) {
  if (!condition) failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
}

// ------------------------------------------------------- 1. platform purity

// Mixing platform APIs inside code presented as cross-platform is what
// common-mistakes.md calls the most damaging class of error, and the skill has
// committed it more than once. Types that exist on one platform only:
const PLATFORM_TYPES = {
  B4A: [
    "Activity", "ImageView", "EditText", "Cursor", "Typeface", "CSBuilder",
    "ThrowException", "StackTrace", "RuntimePermissions", "StartReceiverAt",
    "SupportedOrientations", "EdgeToEdgeOldDevices", "GetContentRect", "NB6",
  ],
  B4J: [
    "Pane", "Node", "ServletRequest", "ServletResponse", "ConnectionPool",
    "AddHandler", "StartMessageLoop", "MainForm",
  ],
  B4i: ["NativeObject", "UIColor", "NSLocale", "iPhoneOrientations", "iPadOrientations"],
};

function* codeBlocks(text) {
  const lines = text.split(/\r?\n/);
  let open = false, body = [], start = 0;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!open && t.startsWith("```b4x")) { open = true; body = []; start = i + 1; continue; }
    if (open && t === "```") { yield { body, line: start }; open = false; continue; }
    if (open) body.push(lines[i]);
  }
}

function labelOf(body) {
  for (const l of body) {
    const m = l.trim().match(/^'\s*(B4X|B4A|B4J|B4i)\b/);
    if (m) return m[1];
    if (l.trim() && !l.trim().startsWith("'")) return null; // code before any label
  }
  return null;
}

// Code inside #If B4A … #End If is guarded on purpose and is exactly how shared
// code is meant to reach a platform API. Only unguarded uses are the bug.
const stripGuards = (code) =>
  code.replace(/^[ \t]*#If\s+(B4A|B4J|B4i)\b[\s\S]*?^[ \t]*#End\s+If[ \t]*$/gim, "");

function platformPurity() {
  for (const f of allRefs()) {
    for (const { body, line } of codeBlocks(refFile(f))) {
      if (labelOf(body) !== "B4X") continue;
      const code = stripGuards(body.join("\n"));
      for (const [platform, types] of Object.entries(PLATFORM_TYPES))
        for (const t of types)
          if (new RegExp(`\\b${t}\\b`).test(code))
            check(
              `platform purity: ${f}:${line}`,
              false,
              `block labelled ' B4X names ${platform}-only \`${t}\``,
            );
    }
  }
}

// ----------------------------------------------------------- 2. regressions

// Each entry is a bug that shipped once. Deleting one of these is deleting the
// only thing standing between the skill and that bug coming back.
const REGRESSIONS = [
  {
    name: "1.1.0 — Initialized() fallback guards against Null",
    file: "language-and-modules.md",
    must: [/(\w+)\s*<>\s*Null\s+And\s+\1\.IsInitialized/i],
    why: "the bare .IsInitialized form throws on a Null reference",
  },
  {
    name: "1.2.0 — targetSdkVersion belongs to the Manifest Editor",
    file: "platform-b4a.md",
    must: [/AddManifestText\(<uses-sdk/],
    mustNot: [/^#TargetSdkVersion:/m],
    why: "#TargetSdkVersion as a project attribute silently does nothing",
  },
  {
    name: "1.2.0 — the edge-to-edge opt-out is taught as a trap",
    file: "common-mistakes.md",
    must: [/windowOptOutEdgeToEdgeEnforcement/, /disabled|Obsolete/i],
    why: "it is inert at targetSdk 36 and fails silently",
  },
  {
    name: "1.3.1 — B4XPages.HandleInsets is documented",
    file: "platform-b4a.md",
    must: [/B4XPages\.HandleInsets/],
    why: "it exists; a bad verification once removed it as fabricated",
  },
  {
    name: "1.5.0 — name collisions are covered",
    file: "language-and-modules.md",
    must: [/Parameter name cannot hide global variable name/],
    why: "identifiers are case-insensitive, so names collide that would not elsewhere",
  },
  {
    name: "1.6.0 — B4i orientation attributes",
    file: "platform-b4i.md",
    must: [/#iPhoneOrientations/, /#iPadOrientations/],
    mustNotInCode: [/#SupportedOrientations/],
    why: "#SupportedOrientations is B4A's form; naming it in prose to warn against it is fine",
  },
  {
    name: "1.6.0 — B4J servers use a connection pool",
    file: "platform-b4j.md",
    must: [/ConnectionPool/, /SingleThreadHandler/],
    why: "one SQL object shared across multithreaded handlers corrupts data silently",
  },
  {
    name: "1.6.0 — the global-SQL rule carries its server exception",
    file: "data-and-io.md",
    must: [/ConnectionPool/],
    why: "the rule and its exception live in different files and must cross-reference",
  },
  {
    name: "1.6.0 — CSBuilder is not presented as cross-platform",
    file: "language-and-modules.md",
    must: [/CSBuilder does not exist in B4J/],
    why: "the type is absent from B4J",
  },
  {
    name: "1.6.0 — multiplatform version floors",
    file: "common-mistakes.md",
    must: [/B4J 10\.2\+/, /B4i 8\.90\+/],
    why: "shared code takes the highest floor of the three, not B4A's",
  },
  {
    name: "1.6.0 — the Play deadline is not written as already past",
    file: "platform-b4a.md",
    mustNot: [/has required .{0,40}since 31 August 2026/s],
    why: "31 August 2026 was still ahead when this was written",
  },
];

function regressions() {
  for (const r of REGRESSIONS) {
    const path = join(REF, r.file);
    if (!existsSync(path)) { check(r.name, false, `${r.file} is missing`); continue; }
    const text = read(path);
    const code = [...codeBlocks(text)].map((b) => b.body.join("\n")).join("\n");
    for (const re of r.must ?? [])
      check(r.name, re.test(text), `${r.file} no longer matches ${re} (${r.why})`);
    for (const re of r.mustNot ?? [])
      check(r.name, !re.test(text), `${r.file} matches ${re} again (${r.why})`);
    for (const re of r.mustNotInCode ?? [])
      check(r.name, !re.test(code), `${r.file} has ${re} in a code block again (${r.why})`);
  }
}

// ------------------------------------------------------- 3. API resolution

// Only this layer can catch an invented API. It needs a B4X install; where there
// is none it reports skipped rather than passing, so an empty run is never
// mistaken for a clean one.
const LIB_DIRS = [
  "C:/Program Files/Anywhere Software/B4A/Libraries",
  "C:/Program Files/Anywhere Software/B4J/Libraries",
];

function apiResolution() {
  const dirs = LIB_DIRS.filter((d) => existsSync(d));
  if (dirs.length === 0) {
    notes.push("API resolution skipped: no B4X installation found. Run locally before a release.");
    return;
  }
  let names = 0;
  for (const d of dirs)
    for (const f of readdirSync(d))
      if (f.endsWith(".xml") || f.endsWith(".b4xlib")) names++;
  notes.push(
    `API resolution: ${dirs.length} library folder(s), ${names} libraries visible. ` +
      "Identifier-level resolution is not automated yet — for a .b4xlib, read the " +
      "shipped source, since a Subs-only listing cannot see a Public variable in " +
      "Process_Globals.",
  );
}

// ------------------------------------------------------------------- run

check("SKILL.md exists", existsSync(SKILL));
platformPurity();
regressions();
apiResolution();

for (const n of notes) console.log(`NOTE  ${n}`);
for (const f of failures) console.log(`FAIL  ${f}`);

if (failures.length) {
  console.log(`\n${failures.length} content check(s) failed.`);
  process.exit(1);
}
console.log(
  `\nOK - platform purity clean, ${REGRESSIONS.length} regression checks passed.`,
);
