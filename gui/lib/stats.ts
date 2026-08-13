import { readTracker, type Row } from "./tracker";

// Rate definitions match .claude/commands/stats.md so GUI and /stats agree.
// Canonical spellings use underscores (offer_declined, no_response); norm() folds
// the legacy space spellings onto them so both read the same.
const RESPONDED = new Set(["interview", "offer", "hired", "offer_declined", "rejected"]);
const INTERVIEWED = new Set(["interview", "offer", "hired", "offer_declined"]);
const OFFERED = new Set(["offer", "hired", "offer_declined"]);
const KNOWN = new Set([
  "drafted", "applied", "interview", "offer", "hired", "offer_declined",
  "rejected", "no_response", "withdrawn",
]);

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "_");

function rate(n: number, total: number) {
  return { n, total, pct: total ? Math.round((n / total) * 1000) / 10 : 0 };
}

export async function computeStats() {
  const rows = await readTracker();
  const total = rows.length;
  const statuses: Record<string, number> = {};
  let responded = 0, interviewed = 0, offered = 0, hired = 0, drafted = 0;

  for (const r of rows) {
    const s = norm(r.status);
    statuses[s || "(blank)"] = (statuses[s || "(blank)"] ?? 0) + 1;
    if (s === "drafted") { drafted++; continue; } // not yet submitted — excluded from rate base
    if (RESPONDED.has(s)) responded++;
    if (INTERVIEWED.has(s)) interviewed++;
    if (OFFERED.has(s)) offered++;
    if (s === "hired") hired++;
  }
  // Rates are computed over submitted applications, not drafts.
  const submitted = total - drafted;

  const now = Date.now();
  const stale = rows.filter((r) => {
    if (norm(r.status) !== "applied") return false;
    const t = Date.parse(r.date);
    return !isNaN(t) && now - t > 14 * 86400_000;
  }).map((r) => ({ company: r.company, role: r.role, date: r.date }));

  const perWeek: Record<string, number> = {};
  for (const r of rows) {
    const t = new Date(r.date);
    if (isNaN(t.getTime())) continue;
    const monday = new Date(t);
    monday.setDate(t.getDate() - ((t.getDay() + 6) % 7));
    const key = monday.toISOString().slice(0, 10);
    perWeek[key] = (perWeek[key] ?? 0) + 1;
  }

  const byDim = (dim: keyof Row) => {
    const out: Record<string, { total: number; responded: number; interviewed: number }> = {};
    for (const r of rows) {
      const v = r[dim].trim();
      if (!v) continue;
      out[v] ??= { total: 0, responded: 0, interviewed: 0 };
      out[v].total++;
      if (RESPONDED.has(norm(r.status))) out[v].responded++;
      if (INTERVIEWED.has(norm(r.status))) out[v].interviewed++;
    }
    return out;
  };

  return {
    total,
    drafted,
    funnel: {
      applied: submitted,
      response: rate(responded, submitted),
      interview: rate(interviewed, submitted),
      offer: rate(offered, submitted),
      hired: rate(hired, submitted),
    },
    statuses,
    unknownStatuses: Object.keys(statuses).filter((s) => !KNOWN.has(s) && s !== "(blank)"),
    stale,
    perWeek: Object.entries(perWeek).sort().slice(-8),
    byChannel: byDim("channel"),
    bySector: byDim("sector"),
    byRoleType: byDim("role_type"),
  };
}
