require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
// Gunakan port dari environment variable (untuk hosting) atau fallback ke 5000 (untuk lokal)
const PORT = process.env.PORT || 5000; 

// --- MIDDLEWARE ---
app.use(cors()); // Agar Frontend (port 5173) boleh akses Backend (port 5000)
app.use(express.json());

// --- DATABASE CONNECTION ---
// Ganti password dan user sesuai settingan PostgreSQL di komputer Anda
const pool = new Pool({
  // Gunakan Environment Variables yang disediakan oleh layanan hosting (Vercel, Heroku, dll.)
  // Fallback ke nilai lokal hanya jika ENV kosong
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

// --- JWT SECRET ---
const JWT_SECRET = 'rahasia_maymonee_super_secure'; 

// --- HELPER: Verify Token Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ message: "Akses ditolak. Token tidak ada." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token tidak valid." });
    req.user = user;
    next();
  });
};

// ================= ROUTES =================

// 1. REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Cek user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar!" });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert User
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );

    // Generate Token
    const token = jwt.sign({ id: newUser.rows[0].id }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: newUser.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 2. LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cek User
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Email atau password salah" });
    }

    // Cek Password
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: "Email atau password salah" });
    }

    // Generate Token
    const token = jwt.sign({ id: user.rows[0].id }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user.rows[0].id, name: user.rows[0].name, email: user.rows[0].email } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 3. DASHBOARD DATA (GET ALL DATA)
// Ini endpoint 'borongan' agar frontend tidak perlu fetch 5x
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Ambil data parallel (bersamaan) agar cepat
    const accountsQuery = pool.query('SELECT * FROM accounts WHERE user_id = $1', [userId]);
    const transactionsQuery = pool.query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC', [userId]);
    const assetsQuery = pool.query('SELECT * FROM assets WHERE user_id = $1', [userId]);
    const recurringQuery = pool.query('SELECT * FROM recurring_transactions WHERE user_id = $1', [userId]);

    const [accounts, transactions, assets, recurring] = await Promise.all([
      accountsQuery, transactionsQuery, assetsQuery, recurringQuery
    ]);

    // Construct response structure sesuai ekspektasi React
    // Note: Budgets & Categories sementara kita hardcode defaultnya dulu jika belum ada tabel khusus
    // agar app tidak crash. Nanti bisa dikembangkan lagi.
    
    const responseData = {
      accounts: accounts.rows,
      transactions: transactions.rows,
      assets: assets.rows,
      recurring: recurring.rows,
      
      // Default Categories (Bisa dipindah ke DB nanti)
      categories: {
        income: ["Gaji Bulanan", "Freelance", "Bonus", "Investasi", "Lainnya"],
        savings: ["Tabungan Umum", "Dana Darurat", "Tabungan Pensiun", "Tabungan Pendidikan"], 
        expenses: ["Sewa Rumah", "Listrik & Air", "Makan & Minum", "Transportasi", "Kesehatan", "Belanja", "Hiburan", "Hutang", "Hadiah", "Investasi", "Lainnya", "Deposito", "Investasi Saham"]
      },
      
      // Default Budgets (Kosong/Placeholder)
      budgets: {} 
    };

    res.json(responseData);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- HELPER ROUTES (UNTUK MEMBUAT DATA AWAL) ---
// Jalankan ini sekali lewat Postman jika ingin akun default
app.post('/api/setup-default', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        await pool.query("INSERT INTO accounts (user_id, name, type, balance) VALUES ($1, 'Dompet Tunai', 'Cash', 0)", [userId]);
        await pool.query("INSERT INTO accounts (user_id, name, type, balance) VALUES ($1, 'Bank Utama', 'Bank', 0)", [userId]);
        res.json({ message: "Default accounts created" });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server Maymonee berjalan di http://localhost:${PORT}`);
});
