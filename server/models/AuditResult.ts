import mongoose from 'mongoose';

const AuditResultSchema = new mongoose.Schema({
  url: { type: String, required: true },
  userId: { type: String, required: true },
  result: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('AuditResult', AuditResultSchema); 