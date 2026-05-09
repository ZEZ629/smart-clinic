/**
 * Smart Clinic System — Server v4.0
 * All existing routes preserved + full admin management APIs
 */

const express = require("express");
const cors    = require("cors");
const fs      = require("fs");
const path    = require("path");

const rateLimit = require("express-rate-limit");
let compression;
try { compression = require("compression"); } catch { compression = null; }

const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests, please try again later."
  }
});

app.use(limiter);

app.disable("x-powered-by");
if (compression) app.use(compression());
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  next();
});
app.use(express.json({ limit: "2mb" }));
app.use(cors());
app.use(express.static(__dirname));

// ── ADMIN AUTH ──────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "84594171";
const adminSessions  = new Set();

function authMiddleware(req, res, next) {
  const token = req.headers["x-admin-token"];
  if (!token || !adminSessions.has(token))
    return res.status(401).json({ error: "Unauthorized" });
  next();
}

app.post("/admin/login", (req, res) => {
  const { password } = req.body || {};
  if (password !== ADMIN_PASSWORD)
    return res.status(403).json({ error: "Wrong password" });
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
  adminSessions.add(token);
  setTimeout(() => adminSessions.delete(token), 8 * 60 * 60 * 1000);
  res.json({ token });
});

app.post("/admin/logout", (req, res) => {
  adminSessions.delete(req.headers["x-admin-token"]);
  res.json({ status: "ok" });
});

// ── DATA STORE ──────────────────────────────────────────────────────────────
const DATA_FILE = path.join(__dirname, "data.json");
let queue               = [];
let current             = null;
let results             = [];
let lastDeviceHeartbeat = 0;

function loadData() {
  try {
    if (!fs.existsSync(DATA_FILE)) return;
    const d = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    queue   = Array.isArray(d.queue)   ? d.queue   : [];
    current = d.current || null;
    results = Array.isArray(d.results) ? d.results : [];
  } catch (e) { console.warn("Load error:", e.message); }
}

function saveData() {
  try { fs.writeFileSync(DATA_FILE, JSON.stringify({ queue, current, results }, null, 2)); }
  catch (e) { console.error("Save error:", e.message); }
}

function detectHealth(bpm) {
  const b = parseFloat(bpm);
  if (isNaN(b)) return "Unknown";
  if (b < 60)  return "Low";
  if (b > 100) return "High";
  return "Norm";
}

// ── PAGES ─────────────────────────────────

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "index.html"));
});

app.get("/result", (req, res) => {
  console.log("RESULT PAGE OPENED");
  res.sendFile(path.resolve(__dirname, "result.html"));
});

app.get("/results", (req, res) => {
  res.json(results);
});

app.get("/admin", (req, res) => {
  res.sendFile(path.resolve(__dirname, "admin.html"));
});

app.get("/api", (req, res) => {
  res.json({ status: "Smart Clinic API v4.0" });
});
// ── PUBLIC: ADD PATIENT ─────────────────────────────────────────────────────
app.post("/add", (req, res) => {
  const { name, phone, age } = req.body || {};
  if (!name || !phone) return res.status(400).json({ error: "Name and phone are required" });
  if (!/^\d{11}$/.test(String(phone).trim())) return res.status(400).json({ error: "Phone must be 11 digits" });
  const parsedAge = parseInt(age);
  if (!age || isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120)
    return res.status(400).json({ error: "Age must be 1–120" });

  const nN = String(name).trim().toLowerCase();
  const nP = String(phone).trim();
  if (queue.some(p => p.name.trim().toLowerCase() === nN || p.phone.trim() === nP) ||
      (current && (current.name.trim().toLowerCase() === nN || current.phone.trim() === nP)))
    return res.status(409).json({ message: "هذا الاسم أو رقم الهاتف مسجل بالفعل في قائمة الانتظار" });

  const patient = { id: Date.now(), name: String(name).trim(), phone: nP, age: parsedAge, joinedAt: new Date().toLocaleTimeString("ar-EG") };
  queue.push(patient);
  if (!current) current = queue.shift();
  saveData();
  res.json({ status: "Added", queuePosition: current?.id === patient.id ? 1 : queue.length + 1 });
});

// ── PUBLIC READS ────────────────────────────────────────────────────────────
app.get("/queue",   (req, res) => res.json(queue));
app.get("/current", (req, res) => { lastDeviceHeartbeat = Date.now(); res.json(current || null); });
app.get("/results", (req, res) => res.json(results));
app.get("/status",  (req, res) => res.json({ online: (Date.now() - lastDeviceHeartbeat) < 10000 }));

app.get("/next", (req, res) => {
  if (!queue.length) { current = null; saveData(); return res.json({ status: "Queue empty", current: null }); }
  current = queue.shift();
  saveData();
  res.json({ status: "OK", current });
});

// ── ESP RESULT ──────────────────────────────────────────────────────────────
app.post("/result", (req, res) => {
  const data = req.body;
  if (!data?.name) return res.status(400).json({ error: "name required" });
  if (data.bpm && !data.health) data.health = detectHealth(data.bpm);
  const now = new Date();
  data.timeReceived = now.toLocaleTimeString("ar-EG");
  data.dateReceived = now.toLocaleDateString("ar-EG");
  if (current && current.name.trim().toLowerCase() === data.name.trim().toLowerCase()) {
    if (!data.age)   data.age   = current.age;
    if (!data.phone) data.phone = current.phone;
  }
  results.unshift(data);
  if (results.length > 200) results.pop();
  lastDeviceHeartbeat = Date.now();
  current = queue.shift() || null;
  saveData();
  res.json({ status: "Saved" });
});

// ── SEARCH RESULT ───────────────────────────────────────────────────────────
app.post("/search-result", (req, res) => {
  const { name, phone } = req.body || {};
  if (!name && !phone) return res.status(400).json({ error: "Provide name or phone" });
  const nN = name  ? name.trim().toLowerCase() : null;
  const nP = phone ? phone.trim() : null;
  let found = null;
  if (nN && nP)     found = results.find(r => r.name?.trim().toLowerCase() === nN && r.phone?.trim() === nP);
  if (!found && nN) found = results.find(r => r.name?.trim().toLowerCase() === nN);
  if (!found && nP) found = results.find(r => r.phone?.trim() === nP);
  return found ? res.json({ found: true, result: found }) : res.status(404).json({ found: false });
});

// ── PUBLIC DELETE / CLEAR ───────────────────────────────────────────────────
app.delete("/remove/:id", (req, res) => {
  queue = queue.filter(p => p.id !== parseInt(req.params.id));
  saveData(); res.json({ status: "Removed" });
});

app.post("/clear", (req, res) => {
  queue = []; current = null; results = []; lastDeviceHeartbeat = 0;
  saveData(); res.json({ status: "Cleared" });
});

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN APIs — all require x-admin-token header
// ══════════════════════════════════════════════════════════════════════════════

// Add patient manually
app.post("/admin/add-patient", authMiddleware, (req, res) => {
  const { name, phone, age } = req.body || {};
  if (!name || !phone) return res.status(400).json({ error: "Name and phone required" });
  const nP = String(phone).trim();
  if (!/^\d{11}$/.test(nP)) return res.status(400).json({ error: "Phone must be 11 digits" });
  const parsedAge = parseInt(age);
  if (!age || isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120)
    return res.status(400).json({ error: "Age must be 1–120" });
  const nN = String(name).trim().toLowerCase();
  if (queue.some(p => p.phone.trim() === nP || p.name.trim().toLowerCase() === nN) ||
      (current && (current.phone.trim() === nP || current.name.trim().toLowerCase() === nN)))
    return res.status(409).json({ error: "Duplicate patient" });
  const patient = { id: Date.now(), name: String(name).trim(), phone: nP, age: parsedAge, joinedAt: new Date().toLocaleTimeString("ar-EG") };
  queue.push(patient);
  if (!current) current = queue.shift();
  saveData();
  res.json({ status: "Added", patient });
});

// Edit queue patient
app.put("/admin/queue/:id", authMiddleware, (req, res) => {
  const id  = parseInt(req.params.id);
  const idx = queue.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not in queue" });
  const { name, phone, age } = req.body;
  if (phone && !/^\d{11}$/.test(String(phone).trim()))
    return res.status(400).json({ error: "Phone must be 11 digits" });
  if (name)  queue[idx].name  = String(name).trim();
  if (phone) queue[idx].phone = String(phone).trim();
  if (age)   { const a = parseInt(age); if (!isNaN(a) && a >= 1 && a <= 120) queue[idx].age = a; }
  saveData();
  res.json({ status: "Updated", patient: queue[idx] });
});

// Edit current patient
app.put("/admin/current", authMiddleware, (req, res) => {
  if (!current) return res.status(404).json({ error: "No current patient" });
  const { name, phone, age } = req.body;
  if (phone && !/^\d{11}$/.test(String(phone).trim()))
    return res.status(400).json({ error: "Phone must be 11 digits" });
  if (name)  current.name  = String(name).trim();
  if (phone) current.phone = String(phone).trim();
  if (age)   { const a = parseInt(age); if (!isNaN(a) && a >= 1 && a <= 120) current.age = a; }
  saveData();
  res.json({ status: "Updated", patient: current });
});

// Reorder queue (full array of ids)
app.post("/admin/queue/reorder", authMiddleware, (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ error: "ids array required" });
  const reordered = [];
  ids.forEach(id => { const p = queue.find(q => q.id === parseInt(id)); if (p) reordered.push(p); });
  queue.forEach(p => { if (!reordered.find(r => r.id === p.id)) reordered.push(p); });
  queue = reordered;
  saveData();
  res.json({ status: "Reordered", queue });
});

// Move patient up or down
app.post("/admin/queue/:id/move", authMiddleware, (req, res) => {
  const id  = parseInt(req.params.id);
  const idx = queue.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const { direction } = req.body;
  const newIdx = direction === "up" ? idx - 1 : idx + 1;
  if (newIdx < 0 || newIdx >= queue.length) return res.json({ status: "Already at edge" });
  [queue[idx], queue[newIdx]] = [queue[newIdx], queue[idx]];
  saveData();
  res.json({ status: "Moved", queue });
});

// Skip patient (move to end)
app.post("/admin/queue/:id/skip", authMiddleware, (req, res) => {
  const id  = parseInt(req.params.id);
  const idx = queue.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const [p] = queue.splice(idx, 1);
  p.skipped = true;
  queue.push(p);
  saveData();
  res.json({ status: "Skipped", queue });
});

// Edit result by index
app.put("/admin/result/:idx", authMiddleware, (req, res) => {
  const i = parseInt(req.params.idx);
  if (i < 0 || i >= results.length) return res.status(404).json({ error: "Not found" });
  const { name, age, phone, bpm, temp, health, notes } = req.body;
  if (name)   results[i].name   = String(name).trim();
  if (age)    { const a = parseInt(age); if (!isNaN(a)) results[i].age = a; }
  if (phone)  results[i].phone  = String(phone).trim();
  if (bpm  !== undefined) { results[i].bpm = parseFloat(bpm); if (!health) results[i].health = detectHealth(results[i].bpm); }
  if (health) results[i].health = health;
  if (temp !== undefined) results[i].temp = parseFloat(temp);
  if (notes !== undefined) results[i].notes = String(notes);
  results[i].editedAt = new Date().toLocaleTimeString("ar-EG");
  saveData();
  res.json({ status: "Updated", result: results[i] });
});

// Delete result
app.delete("/admin/result/:idx", authMiddleware, (req, res) => {
  const i = parseInt(req.params.idx);
  if (i < 0 || i >= results.length)
    return res.status(404).json({ error: "Not found" });

  const [removed] = results.splice(i, 1);
  saveData();

  res.json({ status: "Deleted", removed });
});

app.get("/results", (req, res) => {
  res.json(results);
});
app.get("/test", (req, res) => {
  res.send("SERVER UPDATED");
});
app.use((req, res) =>
  res.status(404).json({ error: "Not found" })
);

const PORT = process.env.PORT || 3000;

loadData();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Smart Clinic v4.0 → http://localhost:${PORT}`);
});