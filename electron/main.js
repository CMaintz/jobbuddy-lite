const { app, BrowserWindow, dialog } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const http = require("http");
const fs = require("fs");

const PORT = Number(process.env.GUI_PORT ?? 8790);

// PORTABLE_EXECUTABLE_DIR is set by electron-builder's NSIS portable target to the
// folder where the user placed (and ran) the exe — i.e., the repo root.
// process.execPath points to the self-extracted temp copy, so we must not use it.
const REPO_ROOT = app.isPackaged
  ? (process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(process.execPath))
  : path.join(__dirname, "..");

let serverProc = null;
let mainWin = null;

function findBun() {
  const candidates = [
    // npm global install (npm install -g bun)
    path.join(process.env.APPDATA || "", "npm", "node_modules", "bun", "bin", "bun.exe"),
    // Direct Windows installer (bun.sh/install.ps1)
    path.join(process.env.USERPROFILE || "", ".bun", "bin", "bun.exe"),
    // macOS/Linux direct installer
    path.join(process.env.HOME || "", ".bun", "bin", "bun"),
  ];
  for (const c of candidates) {
    try {
      if (fs.existsSync(c)) return c;
    } catch {}
  }
  // Fall back to PATH — works if Bun is on PATH and shell resolution is available
  return process.platform === "win32" ? "bun.cmd" : "bun";
}

function waitForServer(retries = 40) {
  return new Promise((resolve) => {
    let tries = 0;
    const check = () => {
      const req = http.get(`http://127.0.0.1:${PORT}/`, (res) => {
        res.resume();
        resolve(true);
      });
      req.setTimeout(400, () => req.destroy());
      req.on("error", () => {
        if (++tries < retries) setTimeout(check, 500);
        else resolve(false);
      });
    };
    setTimeout(check, 800);
  });
}

function startServer() {
  const script = path.join(REPO_ROOT, "gui", "server.ts");
  if (!fs.existsSync(script)) {
    dialog.showErrorBox(
      "Missing files",
      `Could not find gui/server.ts at:\n${script}\n\nMake sure Jobbuddy Lite.exe is in the repo root folder.`
    );
    app.quit();
    return false;
  }

  const bun = findBun();
  serverProc = spawn(bun, ["run", script], {
    cwd: REPO_ROOT,
    stdio: "pipe",
    env: { ...process.env, GUI_PORT: String(PORT) },
    // shell: true needed on Windows when falling back to bun.cmd
    shell: bun.endsWith(".cmd"),
  });

  serverProc.on("error", (err) => {
    dialog.showErrorBox(
      "Cannot start server",
      `Bun is required but could not be launched.\n\nInstall it from https://bun.sh, then try again.\n\nError: ${err.message}`
    );
    app.quit();
  });

  return true;
}

function createWindow() {
  mainWin = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Jobbuddy Lite",
    backgroundColor: "#1a1a2e",
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  });

  mainWin.setMenuBarVisibility(false);

  // Show a loading screen while the server warms up
  mainWin.loadURL(
    `data:text/html,<html><body style="background:%231a1a2e;color:%23eee;` +
      `font-family:system-ui,sans-serif;display:flex;align-items:center;` +
      `justify-content:center;height:100vh;margin:0;font-size:1.2rem">` +
      `<p>Starting Jobbuddy Lite…</p></body></html>`
  );

  mainWin.on("closed", () => {
    mainWin = null;
  });
}

app.whenReady().then(async () => {
  if (!startServer()) return;

  createWindow();

  const ready = await waitForServer();
  if (!ready) {
    dialog.showErrorBox(
      "Server timeout",
      "The GUI server did not respond within 20 seconds.\n\nCheck that Bun is installed and working."
    );
    app.quit();
    return;
  }

  if (mainWin) mainWin.loadURL(`http://127.0.0.1:${PORT}`);
});

app.on("window-all-closed", () => {
  if (serverProc) {
    serverProc.kill();
    serverProc = null;
  }
  app.quit();
});
