const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
// ── CHANGE KARO APNA PASSWORD ─────────────────────────────
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'sarkari@2026';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_DIR = path.join(__dirname, 'data');
const FILES = {
  jobs: path.join(DATA_DIR, 'jobs.json'),
  admitcards: path.join(DATA_DIR, 'admitcards.json'),
  results: path.join(DATA_DIR, 'results.json'),
  answerkeys: path.join(DATA_DIR, 'answerkeys.json'),
};

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

function readData(file) {
  if (!fs.existsSync(file)) return [];
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { return []; }
}
function writeData(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ── SESSION STORE ─────────────────────────────────────────
const sessions = new Set();

function requireAuth(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (sessions.has(token)) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = genId() + genId();
    sessions.add(token);
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Galat username ya password!' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  sessions.delete(req.headers['x-admin-token']);
  res.json({ success: true });
});

app.get('/api/admin/verify', (req, res) => {
  res.json({ valid: sessions.has(req.headers['x-admin-token']) });
});

// ── SEARCH ────────────────────────────────────────────────
app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  if (!q) return res.json([]);
  const labels = { jobs: 'Job', admitcards: 'Admit Card', results: 'Result', answerkeys: 'Answer Key' };
  const results = [];
  Object.entries(FILES).forEach(([type, file]) => {
    readData(file).forEach(item => {
      if ((item.title + ' ' + (item.org || '') + ' ' + (item.description || '')).toLowerCase().includes(q)) {
        results.push({ ...item, _type: type, _typeLabel: labels[type] });
      }
    });
  });
  res.json(results.slice(0, 20));
});

// ── CRUD ──────────────────────────────────────────────────
function setupCRUD(route, file) {
  app.get(`/api/${route}`, (req, res) => res.json(readData(file)));
  app.get(`/api/${route}/:id`, (req, res) => {
    const item = readData(file).find(i => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  });
  app.post(`/api/${route}`, requireAuth, (req, res) => {
    const all = readData(file);
    const newItem = { id: genId(), createdAt: new Date().toISOString(), ...req.body };
    all.unshift(newItem);
    writeData(file, all);
    res.json({ success: true, item: newItem });
  });
  app.put(`/api/${route}/:id`, requireAuth, (req, res) => {
    const all = readData(file);
    const idx = all.findIndex(i => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    all[idx] = { ...all[idx], ...req.body, id: all[idx].id };
    writeData(file, all);
    res.json({ success: true, item: all[idx] });
  });
  app.delete(`/api/${route}/:id`, requireAuth, (req, res) => {
    writeData(file, readData(file).filter(i => i.id !== req.params.id));
    res.json({ success: true });
  });
}

setupCRUD('jobs', FILES.jobs);
setupCRUD('admitcards', FILES.admitcards);
setupCRUD('results', FILES.results);
setupCRUD('answerkeys', FILES.answerkeys);

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => {
  console.log('\n✅  Server chal raha hai!');
  console.log('🌐  Website:     http://localhost:' + PORT);
  console.log('🔧  Admin Panel: http://localhost:' + PORT + '/admin');
  console.log('🔑  Username: ' + ADMIN_USER + '  |  Password: ' + ADMIN_PASS + '\n');
});
