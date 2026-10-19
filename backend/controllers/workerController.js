import Worker from '../models/Worker.js';
import mongoose from 'mongoose';

export const getAllWorkers = async (req, res) => {
  try {
    const { area, search } = req.query;
    let query = {};

    if (area && area !== 'all') {
      query.area = { $regex: area, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const workers = await Worker.find(query).sort({ rating: -1, jobsDone: -1 });
    res.json(workers);
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách người giúp việc', error: error.message });
  }
};

export const getWorkerById = async (req, res) => {
  try {
    const { id } = req.params;
    let worker = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      worker = await Worker.findById(id);
    }

    if (!worker) {
      worker = await Worker.findOne({
        $or: [
          { code: id },
          { code: id.toLowerCase() },
          { name: { $regex: new RegExp(`^${id}$`, 'i') } },
        ],
      });
    }

    if (!worker) {
      return res.status(404).json({ message: 'Không tìm thấy người giúp việc' });
    }

    res.json(worker);
  } catch (error) {
    console.error('Error fetching worker by id:', error);
    res.status(500).json({ message: 'Lỗi khi tìm kiếm người giúp việc', error: error.message });
  }
};

export const createWorker = async (req, res) => {
  try {
    const worker = await Worker.create(req.body);
    res.status(201).json(worker);
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi tạo hồ sơ người giúp việc', error: error.message });
  }
};

export const updateWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Worker.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ để cập nhật' });
    }
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Lỗi cập nhật hồ sơ', error: error.message });
  }
};

export const deleteWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Worker.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ để xóa' });
    }
    res.json({ message: 'Đã xóa người giúp việc thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa người giúp việc', error: error.message });
  }
};

