const express = require('express');
const Transcript = require('../models/Transcript');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const transcripts = await Transcript.find()
      .populate('patientId', 'firstName lastName medicalRecordNumber')
      .sort({ createdAt: -1 });
    res.json(transcripts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const transcript = await Transcript.findById(req.params.id)
      .populate('patientId');
    if (!transcript) {
      return res.status(404).json({ error: 'Transcript not found' });
    }
    res.json(transcript);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const transcript = await Transcript.findById(req.params.id);
    if (!transcript) {
      return res.status(404).json({ error: 'Transcript not found' });
    }

    if (req.body.finalTranscript && req.body.finalTranscript !== transcript.finalTranscript) {
      transcript.editHistory.push({
        editedBy: req.body.editedBy || 'Unknown',
        previousText: transcript.finalTranscript
      });
      transcript.finalTranscript = req.body.finalTranscript;
      transcript.status = 'edited';
    }

    await transcript.save();
    res.json(transcript);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:id/retry-transcription', async (req, res) => {
  try {
    const transcript = await Transcript.findById(req.params.id);
    if (!transcript) {
      return res.status(404).json({ error: 'Transcript not found' });
    }

    if (transcript.status !== 'failed') {
      return res.status(400).json({ error: 'Transcript is not in failed state' });
    }

    console.log('Retrying transcription for:', transcript._id);
    console.log('Audio path:', transcript.audioPath);
    
    const { spawn } = require('child_process');
    const path = require('path');
    const whisperScript = path.join(__dirname, '../../mediscribe-ai/transcribe.py');
    
    const pythonProcess = spawn('python', [whisperScript, transcript.audioPath]);
    
    let whisperResult = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      whisperResult += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', async (code) => {
      if (code !== 0) {
        transcript.metadata.error = errorOutput;
        await transcript.save();
        return res.json({ success: false, error: errorOutput });
      }

      try {
        const whisperData = JSON.parse(whisperResult);
        const whisperText = whisperData.text;
        const wordTimestamps = whisperData.words || [];
        
        transcript.whisperTranscript = whisperText;
        transcript.finalTranscript = whisperText;
        transcript.wordTimestamps = wordTimestamps;
        transcript.status = 'completed';
        
        await transcript.save();
        
        res.json({
          success: true,
          transcript
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Transcript.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transcript deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

