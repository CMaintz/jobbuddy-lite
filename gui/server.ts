import { join } from "path";
import { ROOT, safeResolve } from "./lib/paths";
import { readTracker, updateStatus, addRow } from "./lib/tracker";
import { computeStats } from "./lib/stats";
import { discoverPortals, runPortal } from "./lib/portals";
import { listDocs, readSeenJobs } from "./lib/docs";
import { startRun, getRun, killRun, listRuns, type RunEvent } from "./lib/claude";

const PORT = Number(process.env.GUI_PORT ?? 8790);
const PUBLIC = join(import.meta.dir, "public");

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
const err = (message: string, status = 400) => json({ error: message }, status);

const MIME: Record<string, string> = {
  ".pdf": "application/pdf", ".md": "text/plain; charset=utf-8",
  ".tex": "text/plain; charset=utf-8", ".txt": "text/plain; charset=utf-8",
};

Bun.serve({
  port: PORT,
  hostname: "127.0.0.1",
  idleTimeout: 0,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path === "/" || path === "/index.html") return new Response(Bun.file(join(PUBLIC, "index.html")));
    if (path === "/app.js") return new Response(Bun.file(join(PUBLIC, "app.js")), { headers: { "content-type": "text/javascript" } });
    if (path === "/style.css") return new Response(Bun.file(join(PUBLIC, "style.css")), { headers: { "content-type": "text/css" } });

    if (path.startsWith("/files/")) {
      const full = safeResolve(decodeURIComponent(path.slice(7)));
      if (!full) return err("path not servable", 403);
      const file = Bun.file(full);
      if (!(await file.exists())) return err("not found", 404);
      const ext = full.slice(full.lastIndexOf(".")).toLowerCase();
      return new Response(file, { headers: { "content-type": MIME[ext] ?? "application/octet-stream" } });
    }

    try {
      if (path === "/api/portals" && req.method === "GET") {
        return json(await discoverPortals());
      }

      const search = path.match(/^\/api\/portals\/([\w-]+)\/(search|detail)$/);
      if (search && req.method === "GET") {
        const portals = await discoverPortals();
        const portal = portals.find((p) => p.name === search[1]);
        if (!portal) return err(`unknown portal: ${search[1]}`, 404);
        const args: Record<string, string> = {};
        for (const [k, v] of url.searchParams) args[k] = v;
        if (search[2] === "detail") {
          const id = args.id ?? "";
          delete args.id;
          args._positional = id;
        }
        const result = await runPortal(portal, search[2], args);
        return result.ok ? json(result.data) : err(result.error ?? "portal failed", 502);
      }

      if (path === "/api/tracker" && req.method === "GET") return json(await readTracker());
      if (path === "/api/tracker" && req.method === "POST") {
        return json(await addRow(await req.json()), 201);
      }
      if (path === "/api/tracker" && req.method === "PATCH") {
        const { company, role, status, note } = await req.json();
        if (!company || !role || !status) return err("company, role, status required");
        return json(await updateStatus(company, role, status, note));
      }

      if (path === "/api/stats") return json(await computeStats());
      if (path === "/api/seen-jobs") return json(await readSeenJobs());
      if (path === "/api/docs") return json(await listDocs());

      if (path === "/api/claude/runs" && req.method === "GET") return json(listRuns());
      if (path === "/api/claude" && req.method === "POST") {
        const body = await req.json();
        if (!body.prompt) return err("prompt required");
        return json(startRun(body), 201);
      }

      const runMatch = path.match(/^\/api\/claude\/([\w-]+)\/(stream|kill)$/);
      if (runMatch) {
        const run = getRun(runMatch[1]);
        if (!run) return err("unknown run", 404);
        if (runMatch[2] === "kill" && req.method === "POST") return json({ killed: killRun(run.id) });
        if (runMatch[2] === "stream") {
          const stream = new ReadableStream({
            start(controller) {
              const enc = new TextEncoder();
              const send = (e: RunEvent) => {
                try { controller.enqueue(enc.encode(`data: ${JSON.stringify(e)}\n\n`)); }
                catch { /* client gone */ }
                if (e.kind === "exit") {
                  run.listeners.delete(send);
                  try { controller.close(); } catch {}
                }
              };
              for (const e of run.events) send(e);
              if (run.status === "running") run.listeners.add(send);
            },
            cancel() { /* listener removed on exit */ },
          });
          return new Response(stream, {
            headers: {
              "content-type": "text/event-stream",
              "cache-control": "no-cache",
              connection: "keep-alive",
            },
          });
        }
      }

      return err("not found", 404);
    } catch (e) {
      return err(e instanceof Error ? e.message : String(e), 500);
    }
  },
});

console.log(`ai-job-search GUI  ->  http://127.0.0.1:${PORT}`);
console.log(`workspace: ${ROOT}`);
