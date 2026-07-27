# B4X Skill for Claude Code

A knowledge skill for assisted **B4X** development (B4A / B4J / B4i) — the language,
B4XPages, XUI, SQLite, JSON, resumable subs, runtime permissions, custom views and
`.b4xlib` libraries. It steers the model toward **compilable, idiomatic, correctly
platform-separated** B4X instead of a VB/Java mix with intermingled B4A/B4J/B4i APIs.

This repository is packaged as a **Claude Code plugin marketplace** so it can be installed
with a single command, but the skill also works standalone (Claude.ai Projects, the API,
or a manual copy).

> **Scope:** B4R (Arduino/ESP) is intentionally out of scope — no B4XPages/XUI, different
> types and runtime.

---

## Install (Claude Code)

```
/plugin marketplace add <your-username>/b4x-skill
/plugin install b4x@b4x-marketplace
/reload-plugins
```

The skill loads automatically based on its description whenever a task involves B4X. You
can also install straight from the repo URL without the marketplace step. Before
distributing, replace `<your-username>` (and the `Your Name` placeholders in the JSON /
LICENSE) with your own values.

### Use without Claude Code

- **Claude.ai Projects:** upload the contents of `skills/b4x/` (the `SKILL.md` and
  `references/`) into Project files.
- **Manual (any Claude Code project):** copy `skills/b4x/` to `.claude/skills/b4x/`, or
  point Claude Code at the repo directly with `claude --plugin-dir ./b4x-skill`.
- **API:** use the folder as a custom skill per the Skills API docs.

---

## Repository layout

The repo root is **both** the marketplace and the plugin — the single-plugin layout from
the docs, with no extra `plugins/` wrapper. The marketplace entry points at the plugin
with `"source": "./"`.

```
b4x-skill/                         ← repo root = marketplace root = plugin root
├── .claude-plugin/
│   ├── marketplace.json           ← marketplace catalog (one plugin, source "./")
│   └── plugin.json                ← plugin manifest (name, version — the version authority)
├── skills/
│   └── b4x/
│       ├── SKILL.md               ← router + Quick Rules + Working Style + Compile Checklist
│       └── references/             ← the split reference (10 topic files)
├── LICENSE
├── README.md
└── .gitignore
```

Only `plugin.json` and `marketplace.json` live inside `.claude-plugin/`; `skills/` sits at
the repo root (never inside `.claude-plugin/`). The skill under `skills/b4x/` is
self-contained: `SKILL.md` routes to the topic files in
`references/` so only the relevant part is loaded per task. `references/common-mistakes.md`
is the highest-value file (B4X ≠ VB/Java, platform boundaries, uninitialized collections,
the DB-copy ordering bug). `SKILL.md` also carries a short **Working Style** section
adapting general LLM-coding guardrails to B4X — see _Credits_.

---

## Development & releasing

Test locally before sharing — point Claude Code at the repo without installing:

```bash
claude --plugin-dir ./b4x-skill
```

Validate the marketplace and plugin manifests / skill frontmatter:

```
/plugin validate .
```

Use `/reload-plugins` to pick up edits during a session. On each release, bump `version`
in `.claude-plugin/plugin.json` (the version authority — the docs advise against also
setting it in the marketplace entry); otherwise existing installs won't refresh. Users
update with `/plugin marketplace update`.

The authoritative manifest schema is at code.claude.com/docs (Plugin marketplaces) —
check it if you extend the plugin with commands, agents, hooks, or MCP servers.

---

## Correctness and version notes

- **Fixed vs. the source material:** database init/copy ordering, smart-string number
  format (`$0.2{value}$`), `Array As Object` in SQL, explicit INSERT columns, DDL may use
  `ExecNonQuery`, `Process_Globals` vs `Class_Globals`, `CreateMap` instead of an
  uninitialized map, `IIf` evaluates both arguments, platform labelling of examples.
- **Marked "verify":** some B4XCollections helper signatures and version milestones
  (tagged *(verify)* in `references/compatibility.md`).
- **Versions** (B4A 13.5 / B4J 10.5 / B4i 10.0) are a July 2026 snapshot; confirm against
  b4x.com before claiming "current/latest".

---

## Credits

The **Working Style** section in `SKILL.md` adapts the four behavioural principles from the
Karpathy-inspired Claude Code guidelines (`forrestchang/andrej-karpathy-skills`, MIT).
Only the ideas are reused (reworded, made B4X-specific); the tests-first principle is
replaced with B4X's compile → Debug-run → `Log` loop.

B4X reference content is based on the official B4X documentation and booklets (Anywhere
Software / Erel) and the community forum at b4x.com. B4X, B4A, B4J, B4i, and B4R are
products of Anywhere Software.

## License

MIT — see [LICENSE](LICENSE).
