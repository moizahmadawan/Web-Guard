import mongoose from 'mongoose';
const { Schema } = mongoose;

export const Website = mongoose.model('Website', new Schema({
  url: { type: String, unique: true }, host: String,
}, { timestamps: true }));

export const Scan = mongoose.model('Scan', new Schema({
  website: { type: Schema.Types.ObjectId, ref: 'Website', index: true },
  url: String, host: String,
  status: { type: String, enum: ['queued', 'running', 'done', 'failed'], default: 'queued' },
  scores: { performance: Number, accessibility: Number, bestPractices: Number, seo: Number },
  metrics: { fcp: Number, lcp: Number, tbt: Number, cls: Number, si: Number },
  findings: [{ id: String, title: String, category: String, score: Number, displayValue: String, description: String }],
  error: String, startedAt: Date, finishedAt: Date,
}, { timestamps: true }));
