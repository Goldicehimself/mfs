// Organization Model
const mongoose = require('mongoose');
const { customAlphabet } = require('nanoid');

const orgCodeAlphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const generateOrgCode = customAlphabet(orgCodeAlphabet, 8);
const generateInviteCode = customAlphabet(orgCodeAlphabet, 10);

const inviteSchema = new mongoose.Schema({
  code: { type: String, required: true },
  role: { type: String, required: true },
  expiresAt: { type: Date, default: null },
  usedAt: { type: Date, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: false });

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  industry: { type: String, trim: true },
  orgCode: { type: String, required: true, unique: true, index: true },
  status: { type: String, default: 'active' },
  invites: [inviteSchema]
}, {
  timestamps: true
});

organizationSchema.statics.generateOrgCode = function generateCode() {
  return generateOrgCode();
};

organizationSchema.statics.generateInviteCode = function generateCode() {
  return generateInviteCode();
};

module.exports = mongoose.model('Organization', organizationSchema);
