const express = require('express');
const multer = require('multer');
const path = require('path');
const { transcribeAudio } = require('../controllers/transcriptionController');

const router = express.Router();

const uploadsDir = path.join(__dirname, '../uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp3|wav|m4a|ogg|flac|webm/;
    const mimetypeAllowed = file.mimetype.startsWith('audio/') || file.mimetype === 'video/webm';
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (ext || mimetypeAllowed) {
      return cb(null, true);
    }
    cb(new Error('Only audio files are allowed'));
  }
});

router.post('/', upload.single('audio'), transcribeAudio);

module.exports = router;

