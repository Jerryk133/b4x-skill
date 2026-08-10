# B4X Skill for Claude Code

A focused Agent Skill that helps Claude write, review, and explain idiomatic
**B4X** code for **B4A**, **B4J**, and **B4i**.

It gives Claude practical guidance for B4XPages, XUI, SQLite, JSON, resumable
subs, platform-specific APIs, custom views, and `.b4xlib` libraries. Its main
goal is to prevent common AI-generated mistakes such as mixing B4X with VB.NET
or Java, using the wrong module scope, and combining incompatible B4A, B4J, and
B4i APIs.

> [!NOTE]
> B4R (Arduino and ESP boards) is intentionally outside the scope of this
> skill because it uses a different runtime, type system, and development
> model.

## What this skill improves

- Correct B4X syntax, module types, and variable scope
- Modern B4XPages architecture for new UI projects
- Cross-platform UI code with XUI and `B4XView`
- Clear separation of B4A-, B4J-, and B4i-specific APIs
- Safe SQLite queries, file handling, and JSON processing
- Correct `Sleep`, `Wait For`, resumable-sub, and `HttpJob` patterns
- Practical checks for initialization, resource cleanup, and event signatures
- Review and modernization of older B4X code

## Supported platforms

| Platform | Support | Main topics |
| --- | --- | --- |
| B4A | Yes | Android, permissions, manifest, `JavaObject` |
| B4J | Yes | Desktop UI, JavaFX boundaries, headless servers, jServer |
| B4i | Yes | iOS UI, build and signing, ATS, `NativeObject` |
| Shared B4X | Yes | XUI, B4XPages, SQLite, JSON, I/O, networking |
| B4R | No | Intentionally out of scope |

## Installation

### Claude Code marketplace

Run these commands inside Claude Code:

```text
/plugin marketplace add Jerryk133/b4x-skill
/plugin install b4x@b4x-marketplace
/reload-plugins
```

The plugin is then available across the installation scope you selected.
Claude can activate the skill automatically when your request involves B4X.

### Test locally without installing

Clone the repository and start Claude Code with the plugin directory:

```bash
git clone https://github.com/Jerryk133/b4x-skill.git
claude --plugin-dir ./b4x-skill
```

This is useful when evaluating or developing the skill.

### Install as a standalone Claude Code skill

Copy the `skills/b4x` directory to one of these locations:

| Scope | Destination |
| --- | --- |
| Personal — all projects | `~/.claude/skills/b4x/` |
| Project — current repository | `.claude/skills/b4x/` |

PowerShell:

```powershell
git clone https://github.com/Jerryk133/b4x-skill.git
New-Item -ItemType Directory -Force "$HOME\.claude\skills" | Out-Null
Copy-Item -Recurse -Force ".\b4x-skill\skills\b4x" "$HOME\.claude\skills\b4x"
```

Bash:

```bash
git clone https://github.com/Jerryk133/b4x-skill.git
mkdir -p ~/.claude/skills
cp -R ./b4x-skill/skills/b4x ~/.claude/skills/b4x
```

Start a new Claude Code session after copying the skill if it is not detected
in the current session.

## Usage

The installed plugin can be invoked explicitly as `/b4x:b4x`:

```text
/b4x:b4x Review this B4A B4XPages code and fix any compile errors.
```

When installed as a standalone skill, invoke it as `/b4x`.

In normal use, explicit invocation is optional. Ask Claude naturally:

```text
Create a B4XPages settings page shared by B4A and B4J.
```

```text
Explain why Process_Globals does not compile in my B4XMainPage class.
```

```text
Refactor this SQLite query to use ExecQuery2 and close the ResultSet safely.
```

```text
Convert this B4A-only view code to cross-platform XUI code.
```

For the most useful result, include:

- the target platform or platforms;
- the module type, such as `B4XMainPage`, class, code module, or service;
- the relevant libraries;
- the complete compiler error and affected code when debugging.

## Knowledge included

The skill uses progressive disclosure: `SKILL.md` contains the routing rules
and essential checks, while detailed guidance is loaded only for the topic
being handled.

| Reference | Coverage |
| --- | --- |
| `language-and-modules.md` | Syntax, types, scope, modules, collections |
| `b4xpages-and-xui.md` | B4XPages, XUI, Designer, views, canvas, bitmap, fonts |
| `data-and-io.md` | SQLite, `ResultSet`, transactions, files, JSON |
| `async-network.md` | `Sleep`, `Wait For`, resumable subs, timers, `HttpJob` |
| `custom-views-and-libraries.md` | XUI custom views and `.b4xlib` packaging |
| `bundled-libraries.md` | Libraries shipped with the IDE and what they are for |
| `platform-b4a.md` | Android manifest, permissions, `JavaObject` |
| `platform-b4j.md` | Desktop, JavaFX, servers, handlers, packaging |
| `platform-b4i.md` | iOS build, signing, ATS, `NativeObject` |
| `common-mistakes.md` | Frequent AI and migration errors, version-gated features |

## Repository structure

```text
b4x-skill/
├── .claude-plugin/
│   ├── marketplace.json
│   └── plugin.json
├── .github/
│   └── workflows/
│       └── validate.yml
├── scripts/
│   └── validate.mjs
├── skills/
│   └── b4x/
│       ├── SKILL.md
│       └── references/
│           ├── async-network.md
│           ├── b4xpages-and-xui.md
│           ├── bundled-libraries.md
│           ├── common-mistakes.md
│           ├── custom-views-and-libraries.md
│           ├── data-and-io.md
│           ├── language-and-modules.md
│           ├── platform-b4a.md
│           ├── platform-b4i.md
│           └── platform-b4j.md
├── CHANGELOG.md
├── LICENSE
└── README.md
```

## Limitations

- This is a knowledge skill, not a B4X compiler, IDE extension, or language
  server.
- It does not install B4X, platform SDKs, libraries, or build tools.
- Code still needs to be compiled and tested in the appropriate B4X IDE.
- B4X and mobile-platform requirements evolve. Claims involving the latest IDE,
  Android SDK, iOS, or store policies should be verified against current
  official documentation.
- Some third-party B4X library APIs vary by version. Include the library name
  and version when asking about them.

## Development and validation

Load the repository directly while making changes:

```bash
claude --plugin-dir ./b4x-skill
```

Validate the plugin, marketplace catalog, and skill metadata from Claude Code:

```text
/plugin validate .
```

The repository also carries its own structural validator, which runs on every push
and pull request via GitHub Actions and can be run locally (Node 20+, no
dependencies):

```bash
node scripts/validate.mjs
```

It checks `SKILL.md` frontmatter against the Agent Skills specification and, more
importantly, keeps the progressive-disclosure wiring honest: every `references/`
file named in `SKILL.md` must exist, every file on disk must be routed to from
`SKILL.md`, backticked cross-file mentions must resolve, and the README reference
list must match the files that are actually there. Renaming or deleting a
reference file without updating its routing fails the build.

After editing plugin files, run:

```text
/reload-plugins
```

When publishing a new release, update the version in
`.claude-plugin/plugin.json` and add a matching entry to
[CHANGELOG.md](CHANGELOG.md). The validator fails if the two disagree, so the
changelog cannot silently fall behind.

Versions are read as follows. **MAJOR** means guidance reversed or the scope
changed, so advice you followed before may no longer be recommended. **MINOR**
means new coverage or checks, with existing guidance intact. **PATCH** means
corrections and clarifications. Rearranging files inside `references/` is not
breaking — the skill's interface is what it tells you about B4X, not how its own
files are laid out.

## References and credits

- [B4X official website](https://www.b4x.com/)
- [B4X documentation](https://www.b4x.com/android/documentation.html)
- [B4X Programming Forum](https://www.b4x.com/android/forum/)
- [Claude Code plugins](https://code.claude.com/docs/en/plugins)
- [Claude Code plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces)
- [Agent Skills specification](https://agentskills.io/specification)

The Working Style guidance in this skill adapts ideas from
[`multica-ai/andrej-karpathy-skills`](https://github.com/multica-ai/andrej-karpathy-skills),
licensed under MIT.

B4X, B4A, B4J, B4i, and B4R are products of Anywhere Software.

## License

Released under the [MIT License](LICENSE).
