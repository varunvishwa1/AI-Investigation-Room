import mongoose from 'mongoose';

const mediaAssetSchema = new mongoose.Schema({ assetId: { type: String, required: true, unique: true }, caseId: { type: String, required: true, index: true }, type: { type: String, enum: ['image','audio','video','document'], required: true }, storageReference: { type: String, required: true }, mimeType: { type: String, required: true }, generationStatus: { type: String, enum: ['pending','ready','failed'], default: 'pending' }, metadata: { type: mongoose.Schema.Types.Mixed, default: {} } }, { timestamps: true });
export const MediaAsset = mongoose.models.MediaAsset || mongoose.model('MediaAsset', mediaAssetSchema);
