const express = require('express');
const Patient = require('../models/Patient');
const Transcript = require('../models/Transcript');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, isActive } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { medicalRecordNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const patients = await Patient.find(query).sort({ lastName: 1, firstName: 1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    console.log('Creating patient with data:', req.body);
    const patient = new Patient(req.body);
    await patient.save();
    console.log('Patient created:', patient._id);
    res.status(201).json(patient);
  } catch (error) {
    console.error('Patient creation error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json({ message: 'Patient deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/transcripts', async (req, res) => {
  try {
    const transcripts = await Transcript.find({ patientId: req.params.id })
      .sort({ createdAt: -1 });
    res.json(transcripts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

