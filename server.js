import express from 'express';
import multer from 'multer';
import sqlite3 from 'sqlite3';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync, unlink } from 'fs';
import { createHash } from 'crypto';

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = join(__dirname, 'uploads', 'portfolio');
mkdirSync(uploadsDir, { recursive: true });

const ALLOWED_ORIGINS = ['https://johnplamoottil.github.io', 'http://localhost:3000', 'http://127.0.0.1:5500'];

// Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = file.originalname.split('.').pop();
    cb(null, `${timestamp}-${file.fieldname}.${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Initialize database
const db = new sqlite3.Database(join(__dirname, 'portfolio.db'));

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS portfolio (
      id INTEGER PRIMARY KEY,
      filename TEXT,
      filepath TEXT,
      category TEXT,
      title TEXT,
      type TEXT,
      uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      id INTEGER PRIMARY KEY,
      token TEXT UNIQUE,
      expiresAt DATETIME
    )
  `);
});

// Helper function to hash passwords
function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

// Helper function to generate token
function generateToken() {
  return createHash('sha256').update(Math.random().toString()).digest('hex');
}

// Login endpoint
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  // Check credentials
  if (!username || !password) {
    return res.status(401).json({ error: 'Username and password required' });
  }

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);

  db.run(
    'INSERT INTO admin_sessions (token, expiresAt) VALUES (?, ?)',
    [token, expiresAt.toISOString()],
    (err) => {
      if (err) return res.status(500).json({ error: 'Failed to create session' });
      res.json({ token, expiresAt });
    }
  );
});

// Middleware to verify admin token
function verifyAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  db.get(
    'SELECT * FROM admin_sessions WHERE token = ? AND expiresAt > datetime("now")',
    [token],
    (err, row) => {
      if (err || !row) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      next();
    }
  );
}

// Upload portfolio item
const uploadFiles = (req, res, next) => {
  upload.array('file', 100)(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
};

app.post('/api/admin/upload', verifyAdmin, uploadFiles, async (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { category, title } = req.body;

  try {
    const items = [];
    for (const file of req.files) {
      const type = file.mimetype.startsWith('video') ? 'video' : 'image';
      const filepath = `/uploads/portfolio/${file.filename}`;
      const itemTitle = title || file.originalname;
      const id = await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO portfolio (filename, filepath, category, title, type) VALUES (?, ?, ?, ?, ?)',
          [file.filename, filepath, category, itemTitle, type],
          function (err) {
            if (err) return reject(err);
            resolve(this.lastID);
          }
        );
      });
      items.push({ id, filename: file.filename, filepath, category, title: itemTitle, type });
    }
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save to database' });
  }
});

// Get portfolio items
app.get('/api/portfolio', (req, res) => {
  db.all(
    'SELECT * FROM portfolio ORDER BY uploadedAt DESC',
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch portfolio' });
      res.json(rows || []);
    }
  );
});

// Get portfolio by category
app.get('/api/portfolio/:category', (req, res) => {
  const { category } = req.params;
  db.all(
    'SELECT * FROM portfolio WHERE category = ? ORDER BY uploadedAt DESC',
    [category],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch portfolio' });
      res.json(rows || []);
    }
  );
});

// Delete portfolio item
app.delete('/api/admin/portfolio/:id', verifyAdmin, (req, res) => {
  const { id } = req.params;

  db.get('SELECT filepath FROM portfolio WHERE id = ?', [id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Item not found' });

    db.run('DELETE FROM portfolio WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).json({ error: 'Failed to delete' });
      unlink(join(__dirname, row.filepath), () => {});
      res.json({ success: true });
    });
  });
});

// Logout endpoint
app.post('/api/admin/logout', verifyAdmin, (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  db.run('DELETE FROM admin_sessions WHERE token = ?', [token], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to logout' });
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Admin panel at http://localhost:${PORT}/admin.html`);
});
