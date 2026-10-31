require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/db_jadwal_ujian';

// Koneksi ke MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Terhubung ke database MongoDB'))
  .catch((err) => console.error('❌ Gagal koneksi MongoDB:', err.message));

// Middleware
app.use(express.json());

// Routes
const examScheduleRoutes = require('./routes/examScheduleRoutes');
app.use('/exam-schedules', examScheduleRoutes);

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint tidak ditemukan',
    data: null
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;