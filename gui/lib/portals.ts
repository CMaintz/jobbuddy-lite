import { join } from "path";
import { readdir } from "fs/promises";
import { ROOT } from "./paths";

export type Portal = { name: string; description: string; cli: string };

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
    portals.push({ name, description, cli });
  }
  return portals;
}

export async function runPortal(
  cliPath: string, command: string, args: Record<string, string>,
): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  const argv = ["bun", "run", cliPath, command];
  for (const [k, v] of Object.entries(args)) {
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
