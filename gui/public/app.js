"use strict";
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const api = async (path, opts) => {
  const res = await fetch(path, opts);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || res.statusText);
  return body;
};
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ---------- navigation ---------- */
$$("nav button").forEach((b) =>
  b.addEventListener("click", () => {
    $$("nav button").forEach((x) => x.classList.toggle("active", x === b));
    $$("section.page").forEach((p) => p.classList.toggle("active", p.id === `page-${b.dataset.page}`));
    if (b.dataset.page === "dashboard") loadDashboard();
    if (b.dataset.page === "pipeline") loadPipeline();
    if (b.dataset.page === "docs") loadDocs();
  }),
);

/* ---------- modal ---------- */
const modalBg = $("#modalBg"), modalBox = $("#modalBox");
function openModal(html) { modalBox.innerHTML = html; modalBg.classList.add("open"); }
function closeModal() { modalBg.classList.remove("open"); }
modalBg.addEventListener("click", (e) => { if (e.target === modalBg) closeModal(); });

/* ---------- dashboard ---------- */
async function loadDashboard() {
  const s = await api("/api/stats");
  const f = s.funnel;
  const pct = (r) => `${r.n}/${r.total} (${r.pct}%)`;
  $("#statCards").innerHTML = `
    <div class="card"><div class="k">Applications</div><div class="v">${s.total}</div></div>
    <div class="card"><div class="k">Response rate</div><div class="v">${f.response.pct}%</div><div class="d">${pct(f.response)}</div></div>
    <div class="card"><div class="k">Interview rate</div><div class="v">${f.interview.pct}%</div><div class="d">${pct(f.interview)}</div></div>
    <div class="card"><div class="k">Offer rate</div><div class="v">${f.offer.pct}%</div><div class="d">${pct(f.offer)}</div></div>
    <div class="card"><div class="k">Hired</div><div class="v">${f.hired.n}</div></div>`;

  const stages = [["Applied", s.total], ["Response", f.response.n], ["Interview", f.interview.n], ["Offer", f.offer.n], ["Hired", f.hired.n]];
  const max = Math.max(1, s.total);
  $("#funnelBars").innerHTML = stages.map(([k, v]) =>
    `<div class="bar" style="height:${(v / max) * 100}%"><em>${v}</em><label>${k}</label></div>`).join("");

  const weeks = s.perWeek;
  const wmax = Math.max(1, ...weeks.map(([, n]) => n));
  $("#weekBars").innerHTML = weeks.length
    ? weeks.map(([w, n]) => `<div class="bar" style="height:${(n / wmax) * 100}%"><em>${n}</em><label>${w.slice(5)}</label></div>`).join("")
    : `<div class="empty">No dated applications yet.</div>`;

  $("#staleList").innerHTML = s.stale.length
    ? `<table>${s.stale.map((x) => `<tr><td>${esc(x.company)}</td><td>${esc(x.role)}</td><td>applied ${esc(x.date)}</td><td><button class="btn small ghost" onclick="askOutcome('${esc(x.company)}')">/outcome</button></td></tr>`).join("")}</table>`
    : `<div class="empty">Nothing stale — all open applications are recent.</div>`;

  const ch = Object.entries(s.byChannel);
  $("#byChannel").innerHTML = ch.length
    ? `<table><tr><th>Channel</th><th>Applications</th><th>Responses</th><th>Interviews</th></tr>${
        ch.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${v.total}</td><td>${v.responded}</td><td>${v.interviewed}</td></tr>`).join("")}</table>`
    : `<div class="empty">Channel column not populated yet.</div>`;
}
window.askOutcome = (company) => {
  showPage("assistant");
  sendToClaude(`/outcome ${company}`);
};
function showPage(name) { $(`nav button[data-page="${name}"]`).click(); }

/* ---------- find jobs ---------- */
let portals = [];
(async () => {
  portals = await api("/api/portals");
  $("#portalChips").innerHTML = portals.map((p) =>
    `<div class="chip on" data-name="${esc(p.name)}" title="${esc(p.description)}">${esc(p.name.replace("-search", ""))}</div>`).join("");
  $$("#portalChips .chip").forEach((c) => c.addEventListener("click", () => c.classList.toggle("on")));
})();

$("#jobSearchBtn").addEventListener("click", searchJobs);
$("#jobQuery").addEventListener("keydown", (e) => { if (e.key === "Enter") searchJobs(); });

async function searchJobs() {
  const query = $("#jobQuery").value.trim();
  if (!query) return;
  const location = $("#jobLocation").value.trim();
  const jobage = $("#jobAge").value;
  const active = $$("#portalChips .chip.on").map((c) => c.dataset.name);
  const out = $("#jobResults");
  out.innerHTML = `<div class="empty"><span class="spinner"></span> Searching ${active.length} portal(s)…</div>`;

  const results = await Promise.all(active.map(async (name) => {
    const params = new URLSearchParams({ query, jobage, limit: "20" });
    if (location) params.set("location", location);
    try {
      const data = await api(`/api/portals/${name}/search?${params}`);
      return (data.results ?? []).map((j) => ({ ...j, portal: name }));
    } catch (e) {
      return [{ portal: name, error: e.message }];
    }
  }));

  const jobs = results.flat().filter((j) => !j.error);
  const errors = results.flat().filter((j) => j.error);
  out.innerHTML = (jobs.length ? jobs.map(jobCard).join("") : `<div class="empty">No results.</div>`) +
    errors.map((e) => `<div class="msg err">${esc(e.portal)}: ${esc(e.error)}</div>`).join("");
}

function jobCard(j) {
  const id = encodeURIComponent(j.id ?? "");
  return `<div class="job">
    <div class="t">${esc(j.title)}</div>
    <div class="c">${esc(j.company ?? "—")}</div>
    <div class="m"><span>${esc(j.location ?? "")}</span><span>${esc(j.date ?? "")}</span><span class="badge">${esc(j.portal.replace("-search", ""))}</span></div>
    <div class="actions">
      ${j.url ? `<a class="btn ghost small" href="${esc(j.url)}" target="_blank" rel="noopener">Open</a>` : ""}
      ${j.id ? `<button class="btn ghost small" onclick="jobDetail('${esc(j.portal)}','${id}')">Details</button>` : ""}
      ${j.url ? `<button class="btn small" onclick="applyTo('${esc(j.url)}')">Apply with Claude</button>` : ""}
    </div></div>`;
}

window.jobDetail = async (portal, id) => {
  openModal(`<div class="empty"><span class="spinner"></span> Fetching posting…</div>`);
  try {
    const d = await api(`/api/portals/${portal}/detail?id=${id}`);
    const job = d.result ?? d;
    openModal(`<h2>${esc(job.title ?? "Posting")}</h2>
      <div class="sub">${esc(job.company ?? "")} — ${esc(job.location ?? "")}</div>
      <div class="desc">${esc(job.description ?? JSON.stringify(job, null, 2))}</div>
      <div class="foot" style="margin-top:14px">
        ${job.url ? `<button class="btn" onclick="closeModal();applyTo('${esc(job.url)}')">Apply with Claude</button>` : ""}
        <button class="btn ghost" onclick="closeModal()">Close</button></div>`);
  } catch (e) { openModal(`<div class="msg err">${esc(e.message)}</div>`); }
};
window.closeModal = closeModal;

window.applyTo = (url) => {
  showPage("assistant");
  $("#chatInput").value = `/apply ${url}`;
  $("#chatInput").focus();
};

/* ---------- pipeline ---------- */
const KCOLS = [
  { key: "applied", title: "Applied", statuses: ["applied"] },
  { key: "interview", title: "Interview", statuses: ["interview"] },
  { key: "offer", title: "Offer", statuses: ["offer"] },
  { key: "hired", title: "Hired", statuses: ["hired"] },
  { key: "closed", title: "Closed", statuses: ["rejected", "no response", "withdrawn", "offer declined"] },
];

async function loadPipeline() {
  const rows = await api("/api/tracker");
  const kb = $("#kanban");
  kb.innerHTML = KCOLS.map((col) => {
    const cards = rows.filter((r) => col.statuses.includes((r.status || "").trim().toLowerCase()));
    return `<div class="kcol" data-col="${col.key}">
      <h3>${col.title}<span>${cards.length}</span></h3>
      ${cards.map((r) => `
        <div class="kcard" draggable="true" data-company="${esc(r.company)}" data-role="${esc(r.role)}">
          <div class="co">${esc(r.company)}</div><div class="ro">${esc(r.role)}</div>
          <div class="dt">${esc(r.date)}${r.channel ? " · " + esc(r.channel) : ""}</div>
          ${col.key === "closed" ? `<div class="st"><span class="statuspill pill-closed">${esc(r.status)}</span></div>` : ""}
        </div>`).join("")}
    </div>`;
  }).join("");

  $$(".kcard", kb).forEach((card) => {
    card.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", JSON.stringify({ company: card.dataset.company, role: card.dataset.role }));
    });
  });
  $$(".kcol", kb).forEach((col) => {
    col.addEventListener("dragover", (e) => { e.preventDefault(); col.classList.add("dragover"); });
    col.addEventListener("dragleave", () => col.classList.remove("dragover"));
    col.addEventListener("drop", async (e) => {
      e.preventDefault();
      col.classList.remove("dragover");
      const { company, role } = JSON.parse(e.dataTransfer.getData("text/plain"));
      const target = KCOLS.find((c) => c.key === col.dataset.col);
      if (target.key === "closed") return pickClosedStatus(company, role);
      await patchStatus(company, role, target.statuses[0]);
    });
  });

  const tbl = $("#trackerTable");
  tbl.innerHTML = rows.length
    ? `<table><tr><th>Date</th><th>Company</th><th>Role</th><th>Status</th><th>Channel</th><th>Fit</th><th>Notes</th></tr>${
        rows.map((r) => `<tr><td>${esc(r.date)}</td><td>${esc(r.company)}</td><td>${esc(r.role)}</td><td>${statusPill(r.status)}</td><td>${esc(r.channel)}</td><td>${esc(r.fit_rating)}</td><td style="max-width:340px">${esc(r.notes)}</td></tr>`).join("")}</table>`
    : `<div class="empty">Tracker is empty — apply to something first.</div>`;
}

function statusPill(status) {
  const s = (status || "").trim().toLowerCase();
  const cls = s === "applied" ? "pill-applied" : s === "interview" ? "pill-interview"
    : s === "offer" ? "pill-offer" : s === "hired" ? "pill-hired" : "pill-closed";
  return `<span class="statuspill ${cls}">${esc(status)}</span>`;
}

function pickClosedStatus(company, role) {
  openModal(`<h2>Close application</h2>
    <div class="sub">${esc(company)} — ${esc(role)}</div>
    <div class="grid"><div class="full"><label>Final status</label>
      <select id="closeStatus"><option>rejected</option><option>no response</option><option>withdrawn</option><option>offer declined</option></select>
    </div><div class="full"><label>Note (optional)</label><input id="closeNote" placeholder="e.g. rejected after final round"></div></div>
    <div class="foot"><button class="btn ghost" onclick="closeModal()">Cancel</button>
    <button class="btn" id="closeConfirm">Save</button></div>`);
  $("#closeConfirm").addEventListener("click", async () => {
    await patchStatus(company, role, $("#closeStatus").value, $("#closeNote").value || undefined);
    closeModal();
  });
}

async function patchStatus(company, role, status, note) {
  try {
    await api("/api/tracker", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ company, role, status, note }) });
    loadPipeline();
  } catch (e) { alert(e.message); }
}

$("#addAppBtn").addEventListener("click", () => {
  openModal(`<h2>Add application</h2>
    <div class="grid">
      <div><label>Company *</label><input id="fCompany"></div>
      <div><label>Role *</label><input id="fRole"></div>
      <div><label>Date</label><input id="fDate" type="date" value="${new Date().toISOString().slice(0, 10)}"></div>
      <div><label>Status</label><select id="fStatus"><option>applied</option><option>interview</option><option>offer</option><option>hired</option><option>rejected</option><option>no response</option><option>withdrawn</option><option>offer declined</option></select></div>
      <div><label>Channel</label><input id="fChannel" placeholder="e.g. LinkedIn, referral"></div>
      <div><label>Sector</label><input id="fSector"></div>
      <div class="full"><label>Source URL</label><input id="fSource" placeholder="https://…"></div>
      <div class="full"><label>Notes</label><input id="fNotes"></div>
    </div>
    <div class="foot"><button class="btn ghost" onclick="closeModal()">Cancel</button><button class="btn" id="fSave">Add</button></div>`);
  $("#fSave").addEventListener("click", async () => {
    try {
      await api("/api/tracker", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          company: $("#fCompany").value, role: $("#fRole").value, date: $("#fDate").value,
          status: $("#fStatus").value, channel: $("#fChannel").value, sector: $("#fSector").value,
          source: $("#fSource").value, notes: $("#fNotes").value,
        }),
      });
      closeModal(); loadPipeline();
    } catch (e) { alert(e.message); }
  });
});

$("#viewToggle").addEventListener("click", () => {
  const tbl = $("#trackerTable"), kb = $("#kanban");
  const showTable = tbl.style.display === "none";
  tbl.style.display = showTable ? "" : "none";
  kb.style.display = showTable ? "none" : "";
  $("#viewToggle").textContent = showTable ? "Kanban view" : "Table view";
});

/* ---------- documents ---------- */
async function loadDocs() {
  const docs = await api("/api/docs");
  const groups = {};
  for (const d of docs) (groups[d.group] ??= []).push(d);
  $("#docList").innerHTML = Object.entries(groups).map(([g, files]) =>
    `<div class="g">${esc(g)}</div>` + files.map((f) =>
      `<div class="f" data-path="${esc(f.path)}" title="${esc(f.path)}">${esc(f.name)}</div>`).join("")).join("")
    || `<div class="empty">No documents yet — run /apply.</div>`;
  $$("#docList .f").forEach((el) => el.addEventListener("click", () => previewDoc(el)));
}

async function previewDoc(el) {
  $$("#docList .f").forEach((x) => x.classList.toggle("on", x === el));
  const path = el.dataset.path;
  const pv = $("#docPreview");
  if (path.toLowerCase().endsWith(".pdf")) {
    pv.innerHTML = `<iframe src="/files/${encodeURI(path)}"></iframe>`;
  } else {
    const text = await fetch(`/files/${encodeURI(path)}`).then((r) => r.text());
    pv.innerHTML = `<pre>${esc(text)}</pre>`;
  }
}

/* ---------- assistant ---------- */
let session = { sessionId: null, runId: null, es: null };
const chatlog = $("#chatlog");

function addMsg(cls, html) {
  const div = document.createElement("div");
  div.className = `msg ${cls}`;
  div.innerHTML = html;
  chatlog.appendChild(div);
  chatlog.scrollTop = chatlog.scrollHeight;
  return div;
}

async function sendToClaude(prompt) {
  if (session.runId) return;
  addMsg("user", esc(prompt));
  const thinking = addMsg("meta", `<span class="spinner"></span> Claude is working…`);
  $("#killRun").style.display = "";
  try {
    const { runId, sessionId } = await api("/api/claude", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt, sessionId: session.sessionId ?? undefined, permissionMode: $("#permMode").value }),
    });
    session = { ...session, runId, sessionId };
    const es = new EventSource(`/api/claude/${runId}/stream`);
    session.es = es;
    es.onmessage = (ev) => {
      const { kind, data } = JSON.parse(ev.data);
      if (kind === "stderr") return addMsg("err", esc(String(data)));
      if (kind === "exit") {
        thinking.remove();
        es.close();
        session.runId = null; session.es = null;
        $("#killRun").style.display = "none";
        if (data.status !== "done") addMsg("meta", `run ${esc(data.status)} (exit ${esc(data.code)})`);
        return;
      }
      renderEvent(data);
    };
    es.onerror = () => { /* stream closes on exit; ignore */ };
  } catch (e) {
    thinking.remove();
    session.runId = null;
    $("#killRun").style.display = "none";
    addMsg("err", esc(e.message));
  }
}

function renderEvent(ev) {
  if (ev.type === "assistant" && ev.message?.content) {
    for (const block of ev.message.content) {
      if (block.type === "text" && block.text.trim()) addMsg("claude", esc(block.text));
      if (block.type === "tool_use") {
        const input = block.input?.command ?? block.input?.file_path ?? block.input?.url ?? block.input?.description ?? "";
        addMsg("tool", `🔧 ${esc(block.name)}${input ? ` — ${esc(String(input).slice(0, 110))}` : ""}`);
      }
    }
  } else if (ev.type === "result") {
    const cost = ev.total_cost_usd ? ` · $${ev.total_cost_usd.toFixed(3)}` : "";
    const mins = ev.duration_ms ? ` · ${(ev.duration_ms / 60000).toFixed(1)}m` : "";
    addMsg("meta", `done · ${ev.num_turns ?? "?"} turns${mins}${cost}`);
    loadDashboard().catch(() => {});
  }
}

$("#chatSend").addEventListener("click", () => {
  const v = $("#chatInput").value.trim();
  if (!v) return;
  $("#chatInput").value = "";
  sendToClaude(v);
});
$("#chatInput").addEventListener("keydown", (e) => { if (e.key === "Enter") $("#chatSend").click(); });
$$(".qc").forEach((b) => b.addEventListener("click", () => sendToClaude(b.dataset.cmd)));
$("#newSession").addEventListener("click", () => {
  if (session.es) session.es.close();
  session = { sessionId: null, runId: null, es: null };
  chatlog.innerHTML = `<div class="msg meta">New session.</div>`;
  $("#killRun").style.display = "none";
});
$("#killRun").addEventListener("click", async () => {
  if (session.runId) await api(`/api/claude/${session.runId}/kill`, { method: "POST" });
});

window.sendToClaude = sendToClaude;
loadDashboard();
