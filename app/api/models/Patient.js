const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
  medicalRecordNumber: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String },
  address: { type: String },
  isActive: { type: Boolean, default: true },
  summary: { type: String }
}, { 
  timestamps: true 
});

patientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

patientSchema.set('toJSON', { virtuals: true });
patientSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Patient', patientSchema);

