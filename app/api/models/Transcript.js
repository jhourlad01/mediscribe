const mongoose = require('mongoose');

const transcriptSchema = new mongoose.Schema({
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient', 
    required: true 
  },
  fileName: { type: String, required: true },
  audioPath: { type: String, required: true },
  whisperTranscript: { type: String, required: true },
  finalTranscript: { type: String },
  wordTimestamps: [{
    word: String,
    start: Number,
    end: Number
  }],
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'edited', 'reviewed'],
    default: 'pending' 
  },
  metadata: {
    duration: Number,
    fileSize: Number,
    format: String,
    recordingType: { type: String, enum: ['upload', 'recording'] },
    error: String
  },
  editHistory: [{
    editedBy: String,
    editedAt: { type: Date, default: Date.now },
    previousText: String
  }],
  reviewedAt: { type: Date },
  reviewedBy: { type: String }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Transcript', transcriptSchema);

