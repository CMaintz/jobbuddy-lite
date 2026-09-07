# Search Queries for Job Scraper

## Installed portal CLIs (primary for `/scrape`)

`/scrape` discovers every portal skill under `.agents/skills/*/SKILL.md` and runs its CLI first. Enabled for this Danish-market profile: `linkedin-search`, `freehire-search`, plus the Danish boards `jobindex-search`, `jobbank-search`, `jobdanmark-search`, `jobnet-search`. You do **not** need a matching `site:` line below for those CLIs to run.

The `site:` query templates in this file are the **WebSearch fallback** — for portals without a CLI, company career pages, or when a CLI fails.

**Language scope:** write every query category in **both Danish and English** (Christoffer works in both; see the Languages table in CLAUDE.md). A posting requiring a language he has *not* declared, as a job condition, is excluded before scoring; a posting requiring a *higher level* than declared in a language he *does* work in is flagged for his own judgment, not excluded — see `04-job-evaluation.md`'s Language Gate. Translate keywords idiomatically (e.g. "Backend Developer" → "Backend-udvikler"), not word-for-word.

## Search Sites

Primary (Danish job boards + LinkedIn):
- **Jobindex.dk** - Denmark's largest general job board (covered by `jobindex-search` CLI)
- **linkedin.com/jobs** - filter to Denmark / Aarhus (also covered by `linkedin-search` CLI)
- **Jobbank.dk**, **Jobnet.dk**, **jobdanmark** - additional Danish boards (CLIs enabled)
- **thehub.io** / **ITjob.dk** - Danish tech/startup boards (WebSearch fallback)

Secondary (company career pages via Google):
- Direct Google searches with `site:` filters for Aarhus-area software employers

## Query Categories

Queries are grouped by priority. Write **each category in both Danish and English**. Combine each query with Aarhus-area location terms where the site supports it.

### Priority 1: Backend .NET/C# developer

Strongest and most desired direction.

```
site:jobindex.dk "backend-udvikler" (.NET OR "C#") Aarhus
site:jobindex.dk ".NET-udvikler" Aarhus OR Østjylland
site:linkedin.com/jobs "Backend Developer" ("C#" OR ".NET") Aarhus Denmark
site:linkedin.com/jobs "backend-udvikler" .NET Aarhus
```

### Priority 2: Java / Spring backend & full-stack developer

```
site:jobindex.dk "Java-udvikler" (Spring OR "Spring Boot") Aarhus
site:jobindex.dk ("fullstack-udvikler" OR "full-stack udvikler") Java Aarhus
site:linkedin.com/jobs "Java Developer" ("Spring Boot" OR backend) Aarhus Denmark
site:linkedin.com/jobs "Fullstack Developer" (Java OR ".NET") Aarhus
```

### Priority 3: AI automation / platform / integration

Adjacent directions that lean on the WEXO experience.

```
site:jobindex.dk ("AI Engineer" OR "AI-udvikler" OR "integrationsudvikler") Aarhus
site:jobindex.dk ("platform engineer" OR "platformsudvikler") Aarhus
site:linkedin.com/jobs ("AI Engineer" OR "Integration Developer") Aarhus Denmark
site:linkedin.com/jobs ("LLM" OR "AI automation") developer Denmark remote
```

### Priority 4: Broader software developer (wider net)

```
site:jobindex.dk (softwareudvikler OR systemudvikler) Aarhus
site:jobindex.dk (softwareudvikler OR "graduate developer" OR "junior udvikler") Aarhus
site:linkedin.com/jobs ("Software Developer" OR "Software Engineer") Aarhus Denmark
site:thehub.io (backend OR fullstack) developer Aarhus
```

## Location Filter

Verify each result against these tiers (home base: Viby J, 8260, Aarhus). On-site is fine within the ideal tier.

- **Ideal (on-site OK):** Aarhus C, Viby J, Højbjerg, Risskov, Åbyhøj, Brabrand, Hasselager, Tilst, Skanderborg, Hinnerup — Greater Aarhus, roughly within ~30 min.
- **Acceptable (hybrid/remote-friendly):** Rest of East Jutland within ~45–60 min — Horsens, Randers, Silkeborg, Vejle — if the role is hybrid or remote-leaning.
- **Borderline:** Farther Danish cities (Kolding, Fredericia, Herning) only if strongly hybrid/remote.
- **Remote-only necessity:** Copenhagen, Odense, Aalborg and similar — only if the role is **fully remote**.
- **Too far / exclude:** On-site roles beyond ~60 min daily commute, or any role requiring relocation (deal-breaker).

## Language Filter

Working languages: Danish (native), English (fluent). Apply `04-job-evaluation.md`'s Language Gate: a posting requiring a language not on that table (as a job condition) is excluded; a posting requiring a higher level than declared in Danish/English is flagged, not excluded. Postings simply *written* in another language that don't require it on the job are fine. In practice almost all Danish-market postings pass.

## Date Filter

Only include jobs posted within the last 14 days, or with an application deadline that has not yet passed. If a posting date cannot be determined, include it but flag as "date unknown".

## Adapting Queries

If the user specifies a focus area, select queries from the matching category and also generate 2-3 custom queries for that focus. For example:
- "/scrape .NET" → Priority 1 queries + custom `.NET`-specific queries
- "/scrape AI" → Priority 3 queries + custom LLM/automation queries
