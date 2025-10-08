const { spawn } = require('child_process');
const path = require('path');
const Transcript = require('../models/Transcript');

exports.transcribeAudio = async (req, res) => {
  try {
    console.log('Transcription request received');
    
    if (!req.file) {
      console.log('Error: No file');
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { patientId } = req.body;
    if (!patientId) {
      console.log('Error: No patient ID');
      return res.status(400).json({ error: 'Patient ID is required' });
    }

    console.log('File:', req.file.originalname, 'Size:', req.file.size, 'Path:', req.file.path);
    console.log('Patient ID:', patientId);

    const audioPath = path.resolve(req.file.path);
    const whisperScript = path.join(__dirname, '../../ai/transcribe.py');
    
    console.log('Starting Whisper transcription...');
    console.log('Script path:', whisperScript);
    console.log('Audio path (absolute):', audioPath);
    console.log('File exists check:', require('fs').existsSync(audioPath));
    
    const pythonArgs = [whisperScript, audioPath];
    console.log('Python command:', 'python', pythonArgs.join(' '));
    
    const pythonProcess = spawn('python', pythonArgs);
    
    let whisperResult = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      whisperResult += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.log('Python stderr:', data.toString());
    });

    pythonProcess.on('close', async (code) => {
      console.log('Python process exited with code:', code);
      
      if (code !== 0) {
        console.log('Transcription failed:', errorOutput);
        
        // Save failed transcript so user can see it and retry
        try {
          const failedTranscript = new Transcript({
            patientId,
            fileName: req.file.originalname,
            audioPath: audioPath,
            whisperTranscript: 'Transcription failed',
            finalTranscript: '',
            wordTimestamps: [],
            status: 'failed',
            metadata: {
              fileSize: req.file.size,
              format: req.file.mimetype,
              recordingType: 'upload',
              error: errorOutput
            }
          });
          await failedTranscript.save();
          console.log('Failed transcript saved to database for retry');
        } catch (saveError) {
          console.error('Failed to save error transcript:', saveError);
        }
        
        return res.status(500).json({ error: 'Transcription failed', details: errorOutput });
      }

      try {
        console.log('Whisper raw output:', whisperResult);
        const whisperData = JSON.parse(whisperResult);
        const whisperText = whisperData.text;
        const wordTimestamps = whisperData.words || [];
        
        console.log('Transcription text:', whisperText);
        console.log('Transcription successful');

        const transcript = new Transcript({
          patientId,
          fileName: req.file.originalname,
          audioPath: audioPath,
          whisperTranscript: whisperText,
          finalTranscript: whisperText,
          wordTimestamps: wordTimestamps,
          status: 'completed',
          metadata: {
            fileSize: req.file.size,
            format: req.file.mimetype,
            recordingType: 'upload'
          }
        });

        await transcript.save();
        console.log('Transcript saved to database');

        res.json({
          success: true,
          transcriptId: transcript._id,
          whisperText,
          wordTimestamps
        });
      } catch (error) {
        console.error('Processing error:', error);
        res.status(500).json({ error: 'Failed to process transcription', details: error.message, stack: error.stack });
      }
    });

  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

