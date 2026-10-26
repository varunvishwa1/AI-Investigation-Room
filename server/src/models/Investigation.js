import mongoose from 'mongoose';

const investigationSchema = new mongoose.Schema({ investigationId: { type: String, required: true, unique: true, index: true }, caseId: { type: String, required: true, index: true }, userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true}, status: { type: String, enum: ['active', 'completed'], default: 'active', index: true }, notes: { type: String, default: '' }, selectedSuspectId: { type: String, default: null }, result: { type: mongoose.Schema.Types.Mixed, default: null }, startedAt: { type: Date, default: Date.now }, completedAt: { type: Date, default: null } }, { timestamps: true, minimize: false });
export const Investigation = mongoose.models.Investigation || mongoose.model('Investigation', investigationSchema);
