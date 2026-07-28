# Jobbuddy Lite — Quick Start

Two ways to use this repo: the **Claude Code CLI** (terminal) or the **local web GUI** (`gui/`). Both use the same files, the same skills, and the same Claude Code under the hood — the GUI is just a browser shell over the CLI workflow.

---

## Prerequisites (both versions)

### 1. Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

You need a Claude Pro/Team subscription or an Anthropic API key. Log in:

```bash
claude
```

### 2. Bun

```powershell
powershell -ExecutionPolicy Bypass -c "irm https://bun.sh/install.ps1 | iex"
```

Restart your terminal after install.

### 3. Install the portal CLIs

The job search tools (Jobindex, Jobnet, Jobbank, Jobdanmark, LinkedIn, Freehire) are Bun/TypeScript CLIs. Install their dependencies:

```powershell
# PowerShell
$tools = @("jobbank-search","jobdanmark-search","jobindex-search","jobnet-search","linkedin-search","freehire-search")
foreach ($tool in $tools) {
  Set-Location ".agents/skills/$tool/cli"
  bun install
  Set-Location "..\..\..\.."
}
```

```bash
# Git Bash / zsh
for tool in jobbank-search jobdanmark-search jobindex-search jobnet-search linkedin-search freehire-search; do
  cd .agents/skills/$tool/cli && bun install && cd ../../../..
done
```

### 4. LaTeX (for `/apply` — CV and cover letter compilation)

Install MiKTeX: `winget install MiKTeX.MiKTeX`

Restart your terminal. MiKTeX auto-downloads missing packages on first compile — the first `/apply` run will be slow. Subsequent runs are fast.

Optional but recommended — `pdftotext` for ATS text-layer checks:

```powershell
choco install poppler
```

### 5. Set up your profile

Drop your CV PDF into `documents/cv/`, your LinkedIn data export into `documents/linkedin/`, and any diplomas or references into their respective subfolders. Then:

```bash
claude
/setup
```

`/setup` reads your documents and populates the profile files that every other command depends on. It's idempotent — re-run it any time you add new material.

---

## CLI version

Open a terminal in the repo root and run `claude`. Then use slash commands:

| Command | What it does |
|---------|-------------|
| `/scrape` | Search all portals for new jobs matching your profile |
| `/rank` | Score scraped postings and get a ranked shortlist |
| `/apply <url>` | Full application workflow for a specific job posting |
| `/stats` | Funnel analytics — response/interview/offer rates, stale applications |
| `/html-report` | Generate an offline HTML dashboard from your tracker |
| `/outcome <company>` | Record what happened to an application |
| `/interview` | Build a prep pack for a scheduled interview |
| `/upskill` | Identify skill gaps from your tracked postings |
| `/gmail-sync` | Auto-detect application status updates from your Gmail |

The tracker is `job_search_tracker.csv`. Application archives (CV, cover letter, outcome notes) land in `documents/applications/`.

---

## GUI version

The GUI is a local web app. It runs in your browser at `http://127.0.0.1:8790`. No data leaves your machine.

### Start the server

```bash
cd C:\Users\akash\IdeaProjects\ai-job-search-gui
bun run gui/server.ts
```

Then open `http://127.0.0.1:8790` in a browser.

To change the port: `GUI_PORT=9000 bun run gui/server.ts`

### The five pages

**Dashboard**
At-a-glance funnel: response rate, interview rate, offer rate (each shown as `n/N (x%)`), a per-week bar chart, stale applications list, and a breakdown by channel. Computed from `job_search_tracker.csv` using the same definitions as `/stats`.

**Find Jobs**
Pick portals with the chip buttons, type a search query, hit Search. Results come back as cards. Click **Details** to read the full posting. Click **Apply** to start an `/apply` session for that URL — this opens the Assistant page and kicks off the workflow.

Location filtering: for LinkedIn, put the location in the query (e.g. `developer Aarhus`). For the Danish boards, the portals handle location natively.

**Pipeline (Kanban)**
Every application from your tracker as a drag-and-drop card. Columns: Applied → Interview → Offer → Hired → Closed. Dragging a card updates `job_search_tracker.csv` exactly as `/outcome` would (status + dated note). Closed column opens a final-status picker (rejected / withdrawn / no response / offer declined).

Add new applications with the **+** button at the top right of any column.

**Documents**
Browse and preview generated CVs, cover letters, application archives, and upskill reports. PDFs open inline; `.tex` and `.md` files show as plain text.

**Assistant**
A chat panel that runs Claude Code headless in this workspace. Type any slash command (`/scrape`, `/rank`, `/apply <url>`, `/outcome`, `/upskill`, `/stats`, `/html-report`) or free-form text. The output streams in live.

Follow-up messages within the same session continue the same Claude Code session — so interactive workflows like `/apply` work: Claude will ask you questions mid-run and you answer in the chat box.

The **permission mode** selector controls what Claude can do automatically:
- `acceptEdits` (default) — file edits auto-approved; network and shell require approval
- `bypassPermissions` — fully unattended; use when you trust the run
- `default` — strictly follows `.claude/settings.json`

Quick-launch buttons at the top of the page send `/scrape`, `/rank`, `/upskill`, and `/outcome` in one click.

### Typecheck (development)

```bash
cd gui && bun install && bun run typecheck
```

---

## Desktop app (Electron)

The Electron wrapper turns the GUI into a proper desktop window — no browser tab, no terminal needed for daily use. The resulting `.exe` goes in the repo root and auto-starts the Bun server when launched.

### Build the exe (one-time, done by you)

```bash
npm install            # downloads Electron — ~200 MB, takes a minute
npm run build:win      # produces dist/Jobbuddy Lite.exe
```

Copy `dist/Jobbuddy Lite.exe` to the repo root (next to `gui/`, `CLAUDE.md`, etc.). You can also create a desktop shortcut pointing there.

> Prerequisites that still need to be installed on the target machine: **Bun** (`https://bun.sh`), **Claude Code** (`npm install -g @anthropic-ai/claude-code`), and the portal CLIs (`bun install` in each `.agents/skills/*/cli`). The exe itself is self-contained (Electron is bundled); only Bun must be in PATH or `%USERPROFILE%\.bun\bin\`.

### Daily use

Double-click `Jobbuddy Lite.exe`. A window opens with a "Starting…" screen while the server warms up (~1–2 s), then loads the full GUI. Close the window to stop everything.

---

## Pulling upstream improvements

Your fork's `upstream` remote is already wired to `MadsLorentzen/ai-job-search`. To pull in new upstream releases:

```bash
git fetch upstream
git checkout master
git merge upstream/master
```

The `gui/` folder is only in your fork; upstream never touches it. Merges should be clean.

For the contribution branches (`feat/stats-command`, `feat/ats-coverage-summary`), rebase them after updating master:

```bash
git checkout feat/stats-command
git rebase master
```

See `CONTRIBUTE-UPSTREAM.md` for the full PR process.
