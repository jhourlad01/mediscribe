const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const uploadRouter = require('./routes/upload');
const transcriptsRouter = require('./routes/transcripts');
const patientsRouter = require('./routes/patients');
const audioRouter = require('./routes/audio');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/upload', uploadRouter);
app.use('/api/transcripts', transcriptsRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/audio', audioRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MediScribe API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

