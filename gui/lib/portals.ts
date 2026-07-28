import { join } from "path";
import { readdir } from "fs/promises";
import { ROOT } from "./paths";

export type Portal = { name: string; description: string; cli: string; queryArg: string; locationArg: string | null };

async function detectArgs(cliPath: string): Promise<{ queryArg: string; locationArg: string | null }> {
  const proc = Bun.spawn(["bun", "run", cliPath, "search", "--help", "--format", "json"], {
    cwd: ROOT, stdout: "pipe", stderr: "pipe",
  });
  const out = await new Response(proc.stdout).text();
  await proc.exited;
  let text = "";
  try { text = JSON.parse(out)?.data?.text ?? ""; } catch { return { queryArg: "query", locationArg: null }; }

  // First option matching keyword/free-text search → queryArg
  const qm = text.match(/--([a-z][-a-z]*)[^\n]*(?:keyword|search query|free.text|search string)/i);
  const queryArg = qm?.[1] ?? "query";

  // First option matching location/municipality/region
  const lm = text.match(/--([a-z][-a-z]*)[^\n]*(?:municipality|city|location|region)(?!\s*code|\s*id)/i);
  const locationArg = lm?.[1] ?? null;

  return { queryArg, locationArg };
}

export async function discoverPortals(): Promise<Portal[]> {
  const skillsDir = join(ROOT, ".agents", "skills");
  const portals: Portal[] = [];
  let entries: string[] = [];
  try { entries = await readdir(skillsDir); } catch { return []; }

  for (const name of entries) {
    const cli = join(skillsDir, name, "cli", "src", "cli.ts");
    if (!(await Bun.file(cli).exists())) continue;
    let description = "";
    const skillMd = Bun.file(join(skillsDir, name, "SKILL.md"));
    if (await skillMd.exists()) {
      const m = (await skillMd.text()).match(/^description:\s*>?\s*\n?([\s\S]*?)^(?:\w+:|---)/m);
      description = (m?.[1] ?? "").replace(/\s+/g, " ").trim().slice(0, 200);
    }
    const { queryArg, locationArg } = await detectArgs(cli);
    portals.push({ name, description, cli, queryArg, locationArg });
  }
  return portals;
}

export async function runPortal(
  portal: Portal, command: string, args: Record<string, string>,
): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  const argv = ["bun", "run", portal.cli, command];

  const mapped = { ...args };
  // Translate universal "query" → portal's actual keyword param
  if ("query" in mapped && portal.queryArg !== "query") {
    mapped[portal.queryArg] = mapped.query;
    delete mapped.query;
  }
  // Translate universal "location" → portal's native location param (if any); otherwise append to query
  if ("location" in mapped && mapped.location) {
    if (portal.locationArg && portal.locationArg !== "location") {
      mapped[portal.locationArg] = mapped.location;
      delete mapped.location;
    } else if (!portal.locationArg) {
      // No dedicated location param — append to query keyword
      const qk = portal.queryArg;
      mapped[qk] = mapped[qk] ? `${mapped[qk]} ${mapped.location}` : mapped.location;
      delete mapped.location;
    }
  }

  for (const [k, v] of Object.entries(mapped)) {
    if (v === "") continue;
    if (k === "_positional") argv.push(v);
    else argv.push(`--${k}`, v);
  }
  argv.push("--format", "json");

  const proc = Bun.spawn(argv, { cwd: ROOT, stdout: "pipe", stderr: "pipe" });
  const [out, err] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const code = await proc.exited;
  if (code !== 0) {
    try { return { ok: false, error: JSON.parse(err.trim()).error ?? err.trim() }; }
    catch { return { ok: false, error: err.trim() || `exit ${code}` }; }
  }
  try { return { ok: true, data: JSON.parse(out) }; }
  catch { return { ok: false, error: "portal CLI returned non-JSON output" }; }
}
