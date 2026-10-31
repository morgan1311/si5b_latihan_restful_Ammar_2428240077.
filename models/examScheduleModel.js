const mongoose = require('mongoose');

// 1. EMBEDDED SCHEMA: Ruang Ujian tertanam langsung di dalam jadwal
const ruangSchema = new mongoose.Schema({
  nama: { type: String, required: [true, 'Nama ruang wajib diisi'] },
  gedung: { type: String, default: 'Gedung Utama' },
  kapasitas: { type: Number, default: 40 }
}, { _id: false }); // _id false jika tidak butuh sub-id tersendiri

// 2. PARENT SCHEMA: Jadwal Ujian
const examScheduleSchema = new mongoose.Schema({
  mataKuliah: {
    type: String,
    required: [true, 'Mata kuliah wajib diisi'],
    trim: true
  },
  tanggal: {
    type: String, // Format: YYYY-MM-DD
    required: [true, 'Tanggal ujian wajib diisi']
  },
  jamMulai: {
    type: String, // Format: HH:mm
    required: [true, 'Jam mulai wajib diisi']
  },
  // EMBEDDING: schema ruang tertanam di sini
  ruang: {
    type: ruangSchema,
    required: [true, 'Informasi ruang wajib diisi']
  },
  // REFERENCING: mengarah ke _id dari collection Pengawas
  pengawas: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pengawas',
    required: false
  }
}, { timestamps: true });

module.exports = mongoose.model('ExamSchedule', examScheduleSchema);