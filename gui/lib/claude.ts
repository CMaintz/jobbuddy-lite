import { dirname, join } from "path";
import { ROOT } from "./paths";

export type RunEvent = { kind: "event" | "stderr" | "exit"; data: unknown };
export type Run = {
  id: string;
  sessionId: string;
  prompt: string;
  title: string;
  status: "running" | "done" | "error" | "killed";
  startedAt: number;
  events: RunEvent[];
  listeners: Set<(e: RunEvent) => void>;
  proc: Bun.Subprocess | null;
};

const runs = new Map<string, Run>();

function resolveClaude(): string[] {
  const found = Bun.which("claude");
  if (found && /\.(cmd|ps1|bat)$/i.test(found)) {
    // npm shim: bypass it and run the JS entry point directly, so job URLs
    // with & etc. never pass through cmd.exe parsing
    const cliJs = join(dirname(found), "node_modules", "@anthropic-ai", "claude-code", "cli.js");
    return ["node", cliJs];
  }
  return [found ?? "claude"];
}

const CLAUDE = resolveClaude();

export function listRuns() {
  return [...runs.values()]
    .sort((a, b) => b.startedAt - a.startedAt)
    .map(({ id, sessionId, prompt, title, status, startedAt }) =>
      ({ id, sessionId, prompt: prompt.slice(0, 120), title, status, startedAt }));
}

export function getRun(id: string) {
  return runs.get(id);
}

function emit(run: Run, e: RunEvent) {
  run.events.push(e);
  for (const fn of run.listeners) fn(e);
}

export function startRun(opts: {
  prompt: string;
  sessionId?: string;
  permissionMode?: string;
  title?: string;
}): { runId: string; sessionId: string } {
  const runId = crypto.randomUUID();
  const resuming = !!opts.sessionId;
  const sessionId = opts.sessionId ?? crypto.randomUUID();
  const mode = opts.permissionMode ?? "acceptEdits";

  const argv = [
    ...CLAUDE,
    "-p", opts.prompt,
    "--output-format", "stream-json",
    "--verbose",
    "--permission-mode", mode,
    ...(resuming ? ["--resume", sessionId] : ["--session-id", sessionId]),
  ];

  const run: Run = {
    id: runId, sessionId, prompt: opts.prompt,
    title: opts.title ?? opts.prompt.slice(0, 60),
    status: "running", startedAt: Date.now(),
    events: [], listeners: new Set(), proc: null,
  };
  runs.set(runId, run);

  const proc = Bun.spawn(argv, {
    cwd: ROOT,
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, CLAUDE_CODE_ENTRYPOINT: "ai-job-search-gui" },
  });
  run.proc = proc;

  streamLines(proc.stdout, (line) => {
    try { emit(run, { kind: "event", data: JSON.parse(line) }); }
    catch { emit(run, { kind: "stderr", data: line }); }
  });
  streamLines(proc.stderr, (line) => emit(run, { kind: "stderr", data: line }));

  proc.exited.then((code) => {
    if (run.status === "running") run.status = code === 0 ? "done" : "error";
    emit(run, { kind: "exit", data: { code, status: run.status } });
  });

  return { runId, sessionId };
}

export function killRun(id: string): boolean {
  const run = runs.get(id);
  if (!run || run.status !== "running" || !run.proc) return false;
  run.status = "killed";
  run.proc.kill();
  return true;
}

async function streamLines(stream: ReadableStream<Uint8Array>, onLine: (l: string) => void) {
  const decoder = new TextDecoder();
  let buf = "";
  for await (const chunk of stream) {
    buf += decoder.decode(chunk, { stream: true });
    let nl;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (line) onLine(line);
    }
  }
  if (buf.trim()) onLine(buf.trim());
}
