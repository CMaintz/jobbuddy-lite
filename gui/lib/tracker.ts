import { join } from "path";
import { ROOT } from "./paths";

export const COLUMNS = [
  "date", "company", "sector", "role", "role_type", "channel", "status",
  "contact_person", "fit_rating", "notes", "cv_file", "cover_letter_file", "source",
] as const;

export type Row = Record<(typeof COLUMNS)[number], string>;

const FILE = join(ROOT, "job_search_tracker.csv");

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = "", row: string[] = [], inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function csvField(s: string): string {
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function readTracker(): Promise<Row[]> {
  const file = Bun.file(FILE);
  if (!(await file.exists())) return [];
  const rows = parseCsv(await file.text());
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((cells) => {
    const row = Object.fromEntries(COLUMNS.map((c) => [c, ""])) as Row;
    header.forEach((h, i) => {
      if ((COLUMNS as readonly string[]).includes(h)) (row as any)[h] = cells[i] ?? "";
    });
    return row;
  });
}

async function writeTracker(rows: Row[]): Promise<void> {
  const lines = [COLUMNS.join(",")];
  for (const row of rows) lines.push(COLUMNS.map((c) => csvField(row[c] ?? "")).join(","));
  await Bun.write(FILE, lines.join("\n") + "\n");
}

export async function updateStatus(
  company: string, role: string, status: string, note?: string,
): Promise<Row> {
  const rows = await readTracker();
  const match = rows.filter(
    (r) => r.company.toLowerCase() === company.toLowerCase() &&
           r.role.toLowerCase() === role.toLowerCase(),
  );
  if (match.length !== 1) throw new Error(`expected 1 tracker row for "${company}" / "${role}", found ${match.length}`);
  const row = match[0];
  row.status = status;
  const today = new Date().toISOString().slice(0, 10);
  const entry = `${today}: ${note ?? `status -> ${status} (via GUI)`}`;
  row.notes = row.notes ? `${row.notes}; ${entry}` : entry;
  await writeTracker(rows);
  return row;
}

export async function addRow(input: Partial<Row>): Promise<Row> {
  if (!input.company || !input.role) throw new Error("company and role are required");
  const rows = await readTracker();
  const row = Object.fromEntries(COLUMNS.map((c) => [c, ""])) as Row;
  for (const c of COLUMNS) if (input[c]) row[c] = String(input[c]);
  if (!row.date) row.date = new Date().toISOString().slice(0, 10);
  if (!row.status) row.status = "applied";
  rows.push(row);
  await writeTracker(rows);
  return row;
}
