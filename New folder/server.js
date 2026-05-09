const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

const DATA_FILE = path.join(__dirname, "data.json");

let queue = [];
let current = null;
let results = [];
let lastDeviceHeartbeat = 0;

// تحميل البيانات
function loadData() {
    if (fs.existsSync(DATA_FILE)) {
        const data = JSON.parse(fs.readFileSync(DATA_FILE));
        queue = data.queue || [];
        current = data.current || null;
        results = data.results || [];
    }
}

// حفظ البيانات
function saveData() {
    fs.writeFileSync(DATA_FILE, JSON.stringify({
        queue,
        current,
        results
    }, null, 2));
}

// الصفحة الرئيسية
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// API
app.get("/api", (req, res) => {
    res.send(" Smart Clinic API is running");
});

// إضافة مريض
app.post("/add", (req, res) => {
    const { name, phone } = req.body;

    if (!name || !phone) {
        return res.status(400).json({ error: "Name and phone required" });
    }

    if (!/^\d{11}$/.test(phone)) {
        return res.status(400).json({ error: "Invalid phone" });
    }

    const patient = {
        id: Date.now(),
        name: name.trim(),
        phone: phone.trim(),
        joinedAt: new Date().toLocaleTimeString("ar-EG")
    };

    queue.push(patient);

    if (!current) {
        current = queue.shift();
    }

    saveData();

    res.json({
        status: "Added",
        position: current ? queue.length + 1 : 1
    });
});

// الطابور
app.get("/queue", (req, res) => {
    res.json(queue);
});

// الحالي
app.get("/current", (req, res) => {
    lastDeviceHeartbeat = Date.now();
    res.json(current || null);
});

// Next
app.get("/next", (req, res) => {
    if (queue.length === 0) {
        current = null;
        saveData();
        return res.json({ status: "Queue empty", current: null });
    }

    current = queue.shift();
    saveData();

    res.json({ status: "OK", current });
});

// نتيجة ESP
app.post("/result", (req, res) => {
    const data = req.body;

    if (!data || !data.name) {
        return res.status(400).json({ error: "Invalid data" });
    }

    data.timeReceived = new Date().toLocaleTimeString("ar-EG");
    results.unshift(data);

    if (results.length > 100) results.pop();

    lastDeviceHeartbeat = Date.now();

    current = queue.shift() || null;

    saveData();

    res.json({ status: "Saved" });
});

// النتائج
app.get("/results", (req, res) => {
    res.json(results);
});

// حالة الجهاز
app.get("/status", (req, res) => {
    const online = (Date.now() - lastDeviceHeartbeat) < 10000;
    res.json({ online });
});

// حذف
app.delete("/remove/:id", (req, res) => {
    const id = parseInt(req.params.id);
    queue = queue.filter(p => p.id !== id);
    saveData();
    res.json({ status: "Removed" });
});

// مسح الكل
app.post("/clear", (req, res) => {
    queue = [];
    current = null;
    results = [];
    lastDeviceHeartbeat = 0;
    saveData();
    res.json({ status: "Cleared" });
});

const PORT = 3000;

loadData();

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});