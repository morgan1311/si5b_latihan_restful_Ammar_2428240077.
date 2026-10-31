const ExamSchedule = require('../models/examScheduleModel');

const ExamScheduleController = {
  // GET /exam-schedules dengan Advanced Query
  getAll: async (req, res) => {
    try {
      // 1. FILTERING
      const queryObj = { ...req.query };
      const excludedFields = ['page', 'sort', 'limit', 'fields'];
      excludedFields.forEach((el) => delete queryObj[el]);

      // Filter khusus jika ada query 'ruang' (pencarian ke field embedded ruang.nama)
      if (queryObj.ruang) {
        queryObj['ruang.nama'] = { $regex: queryObj.ruang, $options: 'i' };
        delete queryObj.ruang;
      }

      // Filter pencarian teks mataKuliah (opsional, jika ada)
      if (queryObj.mataKuliah) {
        queryObj.mataKuliah = { $regex: queryObj.mataKuliah, $options: 'i' };
      }

      let query = ExamSchedule.find(queryObj);

      // 2. SORTING (contoh: ?sort=tanggal,-jamMulai)
      if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
      } else {
        query = query.sort('-createdAt'); // Default sort terbaru
      }

      // 3. FIELD PROJECTION (contoh: ?fields=mataKuliah,tanggal,ruang)
      if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ');
        query = query.select(fields);
      } else {
        query = query.select('-__v'); // Sembunyikan version key bawaan mongo
      }

      // 4. PAGINATION (contoh: ?page=1&limit=5)
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const skip = (page - 1) * limit;

      const totalData = await ExamSchedule.countDocuments(queryObj);
      const totalPages = Math.ceil(totalData / limit);

      // 5. REFERENCING POPULATE & EKSEKUSI
      query = query.skip(skip).limit(limit).populate('pengawas', 'nama nip kontak');

      const data = await query;

      return res.status(200).json({
        status: 'success',
        pagination: {
          totalData,
          totalPages,
          currentPage: page,
          limit
        },
        data
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
  },

  // GET /exam-schedules/:id
  getById: async (req, res) => {
    try {
      const data = await ExamSchedule.findById(req.params.id).populate('pengawas', 'nama nip kontak');
      if (!data) {
        return res.status(404).json({
          status: 'error',
          message: `Data dengan id ${req.params.id} tidak ditemukan`,
          data: null
        });
      }
      return res.status(200).json(data);
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Format ID tidak valid atau terjadi kesalahan',
        data: null
      });
    }
  },

  // POST /exam-schedules
  create: async (req, res) => {
    try {
      const { mataKuliah, tanggal, jamMulai, ruang, pengawas } = req.body;

      // Bentuk data ruang (Embedded)
      const dataRuang = typeof ruang === 'string' ? { nama: ruang } : ruang;

      const baru = await ExamSchedule.create({
        mataKuliah,
        tanggal,
        jamMulai,
        ruang: dataRuang,
        pengawas: pengawas || null
      });

      return res.status(201).json({
        status: 'success',
        message: 'Data berhasil ditambahkan',
        data: baru
      });
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
  },

  // PUT /exam-schedules/:id
  update: async (req, res) => {
    try {
      const { mataKuliah, tanggal, jamMulai, ruang, pengawas } = req.body;
      const dataRuang = typeof ruang === 'string' ? { nama: ruang } : ruang;

      const updated = await ExamSchedule.findByIdAndUpdate(
        req.params.id,
        { mataKuliah, tanggal, jamMulai, ruang: dataRuang, pengawas },
        { new: true, runValidators: true }
      );

      if (!updated) {
        return res.status(404).json({
          status: 'error',
          message: `Data dengan id ${req.params.id} tidak ditemukan`,
          data: null
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Data berhasil diperbarui',
        data: updated
      });
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
  },

  // DELETE /exam-schedules/:id
  delete: async (req, res) => {
    try {
      const deleted = await ExamSchedule.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({
          status: 'error',
          message: `Data dengan id ${req.params.id} tidak ditemukan`,
          data: null
        });
      }

      return res.status(200).json({
        status: 'success',
        message: `Data jadwal ujian dengan id ${req.params.id} berhasil dihapus`,
        data: null
      });
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
  }
};

module.exports = ExamScheduleController;