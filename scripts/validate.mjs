#!/usr/bin/env node
// Repo-level validator for the b4x skill + plugin packaging.
// No dependencies; run with `node scripts/validate.mjs`.
//
// Checks, in order:
//   1. SKILL.md frontmatter against the Agent Skills spec
//   2. routing integrity  - every references/*.md named in SKILL.md exists
//   3. orphans            - every references/*.md is reachable from SKILL.md
//   4. cross-file links   - bare `foo.md` mentions inside references resolve
//   5. plugin.json / marketplace.json shape
//   6. CHANGELOG          - the released version has an entry
//   7. README             - reference list matches the files on disk

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL_DIR = join(ROOT, "skills", "b4x");
const REF_DIR = join(SKILL_DIR, "references");

const errors = [];
const warnings = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

const read = (p) => readFileSync(p, "utf8");

// ---------------------------------------------------------------- frontmatter

// Minimal YAML subset: scalars, folded (>) and literal (|) blocks, one level of
// nested mapping. Enough for skill frontmatter, deliberately not a YAML parser.
function parseFrontmatter(text, where) {
  const lines = text.split(/\r?\n/);
  if (lines[0].trim() !== "---") {
    fail(where, "must start with a `---` frontmatter delimiter on line 1");
    return null;
  }
  const end = lines.indexOf("---", 1);
  if (end === -1) {
    fail(where, "frontmatter is not closed with `---`");
    return null;
  }

  const out = {};
  const body = lines.slice(1, end);
  for (let i = 0; i < body.length; i++) {
    const line = body[i];
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    if (/^\s/.test(line)) continue; // consumed by a block below

    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) {
      fail(where, `cannot parse frontmatter line ${i + 2}: ${line}`);
      continue;
    }
    const [, key, rawValue] = m;
    const value = rawValue.trim();

    if (value === ">" || value === "|" || value === ">-" || value === "|-") {
      const block = [];
      while (i + 1 < body.length && (/^\s+\S/.test(body[i + 1]) || !body[i + 1].trim())) {
        block.push(body[++i].trim());
      }
      out[key] = value.startsWith(">")
        ? block.join(" ").replace(/\s+/g, " ").trim()
        : block.join("\n").trim();
    } else if (value === "") {
      const map = {};
      while (i + 1 < body.length && /^\s+\S/.test(body[i + 1])) {
        const sub = body[++i].trim().match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
        if (sub) map[sub[1]] = sub[2].trim().replace(/^["']|["']$/g, "");
      }
      out[key] = map;
    } else {
      out[key] = value.replace(/^["']|["']$/g, "");
    }
  }
  return { data: out, bodyLineCount: lines.length - end - 1 };
}

const SPEC_FIELDS = new Set([
  "name",
  "description",
  "license",
  "compatibility",
  "metadata",
  "allowed-tools",
]);

function checkFrontmatter() {
  const path = join(SKILL_DIR, "SKILL.md");
  const where = "skills/b4x/SKILL.md";
  if (!existsSync(path)) {
    fail(where, "file is missing");
    return;
  }
  const parsed = parseFrontmatter(read(path), where);
  if (!parsed) return;
  const { data, bodyLineCount } = parsed;

  // name
  const name = data.name;
  if (!name) {
    fail(where, "`name` is required");
  } else {
    if (name.length > 64) fail(where, `\`name\` is ${name.length} chars, max is 64`);
    if (!/^[a-z0-9-]+$/.test(name))
      fail(where, `\`name\` may only contain a-z, 0-9 and hyphens (got "${name}")`);
    if (name.startsWith("-") || name.endsWith("-"))
      fail(where, "`name` must not start or end with a hyphen");
    if (name.includes("--")) fail(where, "`name` must not contain consecutive hyphens");
    const dir = basename(SKILL_DIR);
    if (name !== dir)
      fail(where, `\`name\` ("${name}") must match the parent directory name ("${dir}")`);
  }

  // description
  const description = data.description;
  if (!description || !description.trim()) {
    fail(where, "`description` is required and must be non-empty");
  } else if (description.length > 1024) {
    fail(where, `\`description\` is ${description.length} chars, max is 1024`);
  }

  // optional fields
  if (data.compatibility && data.compatibility.length > 500)
    fail(where, `\`compatibility\` is ${data.compatibility.length} chars, max is 500`);

  for (const key of Object.keys(data))
    if (!SPEC_FIELDS.has(key)) warn(where, `\`${key}\` is not an Agent Skills spec field`);

  // body size - spec recommends keeping SKILL.md under 500 lines
  if (bodyLineCount > 500)
    warn(where, `body is ${bodyLineCount} lines; the spec recommends under 500`);
}

// -------------------------------------------------------------------- routing

const REF_RE = /references\/([a-z0-9-]+\.md)/g;
const BARE_RE = /`([a-z0-9-]+\.md)`/g;

function listRefs() {
  if (!existsSync(REF_DIR) || !statSync(REF_DIR).isDirectory()) {
    fail("skills/b4x/references", "directory is missing");
    return [];
  }
  return readdirSync(REF_DIR).filter((f) => f.endsWith(".md")).sort();
}

function checkRouting(refs) {
  const skill = read(join(SKILL_DIR, "SKILL.md"));
  const routed = new Set([...skill.matchAll(REF_RE)].map((m) => m[1]));

  for (const f of routed)
    if (!refs.includes(f))
      fail("skills/b4x/SKILL.md", `routes to references/${f}, which does not exist`);

  for (const f of refs)
    if (!routed.has(f))
      fail(
        "skills/b4x/SKILL.md",
        `references/${f} exists but nothing routes to it - add a row to the routing table or delete the file`,
      );
}

function checkCrossLinks(refs) {
  const known = new Set(refs);
  for (const f of refs) {
    const text = read(join(REF_DIR, f));
    const seen = new Set();
    for (const [, target] of text.matchAll(BARE_RE)) {
      if (target === f || seen.has(target)) continue;
      seen.add(target);
      if (!known.has(target) && target !== "SKILL.md")
        fail(`skills/b4x/references/${f}`, `mentions \`${target}\`, which does not exist`);
    }
  }
}

// -------------------------------------------------------------------- packaging

function readJson(rel) {
  const path = join(ROOT, rel);
  if (!existsSync(path)) {
    fail(rel, "file is missing");
    return null;
  }
  try {
    return JSON.parse(read(path));
  } catch (e) {
    fail(rel, `is not valid JSON - ${e.message}`);
    return null;
  }
}

// Keeps the release ritual honest: README tells you to bump plugin.json, so the
// bump must come with a changelog entry rather than silently drifting.
function checkChangelog(version) {
  const path = join(ROOT, "CHANGELOG.md");
  if (!existsSync(path)) {
    fail("CHANGELOG.md", "file is missing");
    return;
  }
  const text = read(path);
  const released = [...text.matchAll(/^## \[(\d+\.\d+\.\d+)\]/gm)].map((m) => m[1]);

  if (!version) return;
  if (!released.includes(version))
    fail(
      "CHANGELOG.md",
      `plugin.json is at ${version} but there is no \`## [${version}]\` entry`,
    );
  if (released.length && released[0] !== version)
    warn(
      "CHANGELOG.md",
      `newest entry is ${released[0]} but plugin.json is at ${version}`,
    );
}

function checkPackaging() {
  const plugin = readJson(".claude-plugin/plugin.json");
  if (plugin) {
    const where = ".claude-plugin/plugin.json";
    for (const field of ["name", "description", "version"])
      if (!plugin[field]) fail(where, `\`${field}\` is required`);
    if (plugin.version && !/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(plugin.version))
      fail(where, `\`version\` "${plugin.version}" is not semver`);
    checkChangelog(plugin.version);
  }

  const market = readJson(".claude-plugin/marketplace.json");
  if (market) {
    const where = ".claude-plugin/marketplace.json";
    if (!Array.isArray(market.plugins) || market.plugins.length === 0) {
      fail(where, "`plugins` must be a non-empty array");
    } else {
      for (const p of market.plugins) {
        if (!p.name) fail(where, "a plugins[] entry has no `name`");
        if (!p.source) {
          fail(where, `plugin "${p.name}" has no \`source\``);
        } else if (p.source.startsWith(".") && !existsSync(join(ROOT, p.source))) {
          fail(where, `plugin "${p.name}" source "${p.source}" does not exist`);
        }
        if (plugin && p.name && plugin.name && p.name !== plugin.name)
          fail(where, `plugin "${p.name}" does not match plugin.json name "${plugin.name}"`);
      }
    }
  }
}

// ----------------------------------------------------------------------- README

function checkReadme(refs) {
  const path = join(ROOT, "README.md");
  if (!existsSync(path)) {
    warn("README.md", "file is missing");
    return;
  }
  const text = read(path);
  const known = new Set([...refs, "README.md", "SKILL.md", "changelog.md"]);

  for (const f of refs)
    if (!text.includes(f))
      fail("README.md", `references/${f} exists but is not listed in the README`);

  const mentioned = new Set([...text.matchAll(/([a-z0-9-]+\.md)/g)].map((m) => m[1]));
  for (const f of mentioned)
    if (!known.has(f))
      fail("README.md", `mentions \`${f}\`, which no longer exists`);
}

// ------------------------------------------------------------------------- run

checkFrontmatter();
const refs = listRefs();
if (refs.length) {
  checkRouting(refs);
  checkCrossLinks(refs);
  checkReadme(refs);
}
checkPackaging();

for (const w of warnings) console.log(`WARN  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);

if (errors.length) {
  console.log(`\n${errors.length} error(s), ${warnings.length} warning(s).`);
  process.exit(1);
}
console.log(
  `OK - ${refs.length} reference files, frontmatter and packaging valid` +
    (warnings.length ? ` (${warnings.length} warning(s))` : ""),
);
