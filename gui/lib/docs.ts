import { join, relative } from "path";
import { readdir, stat } from "fs/promises";
import { ROOT } from "./paths";

export type Doc = { path: string; name: string; group: string; mtime: number };

async function collect(dir: string, group: string, exts: string[], out: Doc[], depth = 0) {
  let entries: string[] = [];
  try { entries = await readdir(join(ROOT, dir)); } catch { return; }
  for (const name of entries) {
    const rel = `${dir}/${name}`;
    const st = await stat(join(ROOT, rel)).catch(() => null);
    if (!st) continue;
    if (st.isDirectory() && depth < 2) await collect(rel, group, exts, out, depth + 1);
    else if (exts.some((e) => name.toLowerCase().endsWith(e))) {
      out.push({ path: rel.replace(/\\/g, "/"), name, group, mtime: st.mtimeMs });
    }
  }
}

export async function listDocs(): Promise<Doc[]> {
  const out: Doc[] = [];
  await collect("cv", "CVs", [".pdf", ".tex"], out);
  await collect("cover_letters", "Cover letters", [".pdf", ".tex"], out);
  await collect("documents/applications", "Application archives", [".pdf", ".md", ".tex"], out);
  await collect("upskill", "Upskill reports", [".md"], out);
  return out
    .filter((d) => !/example/i.test(d.name) && !d.path.includes("OpenFonts"))
    .sort((a, b) => b.mtime - a.mtime);
}

export async function readSeenJobs(): Promise<unknown[]> {
  const file = Bun.file(join(ROOT, "job_scraper", "seen_jobs.json"));
  if (!(await file.exists())) return [];
  try {
    const data = JSON.parse(await file.text());
    const seen = data.seen ?? data;
    return Object.entries(seen).map(([key, v]) => ({ key, ...(v as object) }));
  } catch { return []; }
}
