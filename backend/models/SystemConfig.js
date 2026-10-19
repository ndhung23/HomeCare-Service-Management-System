import mongoose from 'mongoose';

const systemConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'PRIMARY_CONFIG',
    },
    baseHourlyRates: {
      CLEANING: { type: Number, default: 70000 },
      DEEP_CLEANING: { type: Number, default: 100000 },
      COOKING: { type: Number, default: 85000 },
      LAUNDRY: { type: Number, default: 70000 },
      ELDERLY_CARE: { type: Number, default: 90000 },
    },
    serviceStatus: {
      CLEANING: { type: Boolean, default: true },
      DEEP_CLEANING: { type: Boolean, default: true },
      COOKING: { type: Boolean, default: true },
      LAUNDRY: { type: Boolean, default: true },
      ELDERLY_CARE: { type: Boolean, default: true },
    },
    holidays: {
      type: [String], // Format: YYYY-MM-DD
      default: ['2026-01-01', '2026-04-30', '2026-05-01', '2026-09-02'],
    },
    holidayMultiplier: {
      type: Number,
      default: 0.2, // +20%
    },
    helperCommissionRate: {
      type: Number,
      default: 0.2, // 20%
    },
    enterpriseCommissionRate: {
      type: Number,
      default: 0.12, // 12%
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema);
export default SystemConfig;

