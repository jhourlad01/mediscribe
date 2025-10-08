# MediScribe API

Express backend for MediScribe medical transcription app.

## Setup

```bash
npm install
cp env.example .env
# Configure your environment variables
npm run dev
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## Environment Variables

```
PORT=5000
MONGO_URI=mongodb+srv://...
REDIS_URL=redis://localhost:6379
WHISPER_MODEL=small
OLLAMA_MODEL=mistral
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### POST /api/upload
Upload audio file for transcription.

**Request**: multipart/form-data with `audio` file

**Response**:
```json
{
  "success": true,
  "transcriptId": "...",
  "whisperText": "...",
  "validatedText": "..."
}
```

### GET /api/transcripts
Get all transcripts.

**Response**: Array of transcript objects

### GET /api/transcripts/:id
Get specific transcript by ID.

**Response**: Transcript object

### DELETE /api/transcripts/:id
Delete transcript by ID.

**Response**:
```json
{
  "message": "Transcript deleted"
}
```

### GET /api/health
Health check endpoint.

## Structure

```
api/
├── server.js           # Express entry point
├── routes/
│   ├── upload.js       # File upload route
│   └── transcripts.js  # Transcript CRUD routes
├── controllers/
│   ├── transcriptionController.js  # Whisper integration
│   └── validationController.js     # Ollama integration
├── models/
│   └── Transcript.js   # MongoDB schema
└── uploads/            # Temporary audio storage
```

