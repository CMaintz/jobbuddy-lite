import { resolve, join, normalize } from "path";

export const ROOT = resolve(import.meta.dir, "..", "..");

const SERVABLE_ROOTS = ["cv", "cover_letters", "documents", "upskill"];

export function safeResolve(rel: string): string | null {
  const full = normalize(join(ROOT, rel));
  if (!full.startsWith(ROOT)) return null;
  const top = full.slice(ROOT.length + 1).split(/[\\/]/)[0];
  if (!SERVABLE_ROOTS.includes(top)) return null;
  return full;
}
