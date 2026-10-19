import Service from '../models/Service.js';
import mongoose from 'mongoose';

export const getAllServices = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const services = await Service.find(query).sort({ createdAt: 1 });
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách dịch vụ', error: error.message });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    let service = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      service = await Service.findById(id);
    }

    if (!service) {
      service = await Service.findOne({
        $or: [
          { serviceCode: id },
          { serviceCode: id.toUpperCase() },
          { serviceCode: id.toLowerCase() },
        ],
      });
    }

    if (!service) {
      return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    }

    res.json(service);
  } catch (error) {
    console.error('Error fetching service by id:', error);
    res.status(500).json({ message: 'Lỗi khi tìm kiếm dịch vụ', error: error.message });
  }
};

export const createService = async (req, res) => {
  try {
    const newService = await Service.create(req.body);
    res.status(201).json(newService);
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi tạo mới dịch vụ', error: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Service.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy dịch vụ để cập nhật' });
    }
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Lỗi cập nhật dịch vụ', error: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Service.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Không tìm thấy dịch vụ để xóa' });
    }
    res.json({ message: 'Đã xóa dịch vụ thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa dịch vụ', error: error.message });
  }
};

