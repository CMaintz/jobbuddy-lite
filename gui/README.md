# GUI — a thin shell over the ai-job-search workflow

A local web GUI for this fork. It adds presentation on top of the existing Claude Code workflow without reimplementing any of it:

- **Dashboard** — funnel analytics computed from `job_search_tracker.csv`, using the same rate definitions as the `/stats` command.
- **Find Jobs** — searches the installed portal CLIs under `.agents/skills/*` directly (`search`/`detail`, `--format json`). Portals added with `/add-portal` show up automatically.
- **Pipeline** — Kanban/table over the tracker. Dragging a card updates the same CSV `/outcome` writes (status + dated note, columns never restructured).
- **Documents** — browse and preview generated CVs, cover letters, application archives, and upskill reports.
- **Assistant** — runs Claude Code headless in this workspace (`claude -p --output-format stream-json`) and streams the session into a chat panel. `/scrape`, `/rank`, `/apply <url>`, `/outcome`, `/upskill` and free-form replies all work; follow-up messages resume the same session, so interactive workflows like `/apply` behave exactly as in the terminal.

## Design rule

The GUI holds **no job logic**: no scraping, no LLM calls, no document generation. It spawns the portal CLIs and Claude Code, and reads/writes the same flat files the skills use. New behavior belongs in a skill or command, not in the GUI — that keeps this fork cleanly rebaseable on upstream.

## Run

Prerequisites: everything the main [README](../README.md) requires (Claude Code, Bun, LaTeX for `/apply`).

```bash
bun run gui/server.ts
# open http://127.0.0.1:8790
```

`GUI_PORT` overrides the port. The server binds to localhost only.

## Permission modes

The Assistant runs with `--permission-mode acceptEdits` by default: file edits are auto-approved, everything else follows `.claude/settings.json`. Switch to `bypassPermissions` for fully unattended runs (your responsibility), or `default` if you prefer runs to fail closed on anything not pre-approved.

## Typecheck

```bash
cd gui && bun install && bun run typecheck
```

Zero runtime dependencies — `bun install` only pulls TypeScript dev types, same convention as the portal CLIs.
