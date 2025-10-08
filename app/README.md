# MediScribe - Local AI Medical Transcription App

Local medical transcription application using Whisper AI, with Next.js frontend and Node.js + Express backend.

## Architecture

```
/app
├── web/              # Next.js frontend (port 3000)
├── api/              # Node.js + Express backend (port 5000)
└── ai/               # Python AI scripts (Whisper transcription)
```

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Material-UI
- **Backend**: Node.js, Express, MongoDB Atlas
- **AI**: OpenAI Whisper (local transcription with word-level timestamps)

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.8+
- **ffmpeg** (REQUIRED for audio): `winget install ffmpeg` or download from https://ffmpeg.org
- MongoDB Atlas account

### 1. Backend API Setup

```bash
cd api
npm install
cp env.example .env
# Edit .env with your MongoDB URI
npm run dev
```

### 2. Frontend Setup

```bash
cd web
npm install
cp env.example .env.local
npm run dev
```

### 3. AI Setup

```bash
cd ai
pip install -r requirements.txt
```

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/mediscribe
WHISPER_MODEL=base
WHISPER_LANGUAGE=en
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## User Workflow

1. **Patient List** - Home page displays all patients with search functionality
2. **Create Patient** - Add new patient with basic information
3. **Patient Details** - View patient info, summary, and transcriptions
4. **Upload Audio** - Upload audio files for transcription
5. **Record Audio** - Record audio directly in browser
6. **AI Processing** - Whisper transcribes → Ollama validates/corrects
7. **Edit Transcript** - Doctor reviews and edits with access to original versions
8. **Save Changes** - Edits are tracked with history

[📖 **Detailed Workflow Documentation →** WORKFLOW.md](./WORKFLOW.md)

## Communication Flow

```
User Browser (3000) 
  ↓ HTTP
Express API (5000)
  ↓ subprocess
  ├→ Python Whisper (transcribe with word timestamps)
  └→ MongoDB Atlas (store)
```

## Features

✅ **Patient Management**
- Create, view, search patients
- Patient profiles with demographics
- Medical record numbers

✅ **Audio Capture**
- Upload audio files (mp3, wav, m4a, ogg, flac)
- In-browser audio recording
- File size and format validation

✅ **AI Transcription**
- Whisper AI transcription
- Ollama validation and correction
- Medical terminology optimization

✅ **Transcript Management**
- View original, validated, and edited versions
- Edit history tracking
- Status indicators

✅ **Modern UI**
- Material-UI components
- Responsive design
- Real-time updates
- Progress indicators

## API Endpoints

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient details
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient
- `GET /api/patients/:id/transcripts` - Get patient transcripts

### Transcripts
- `POST /api/upload` - Upload audio and transcribe
- `GET /api/transcripts` - Get all transcripts
- `GET /api/transcripts/:id` - Get transcript
- `PUT /api/transcripts/:id` - Update transcript
- `DELETE /api/transcripts/:id` - Delete transcript
- `GET /api/health` - Health check

## Development

```bash
# Start all services in separate terminals

# Terminal 1: Backend
cd api && npm run dev

# Terminal 2: Frontend
cd web && npm run dev

# Terminal 3: Redis (if local)
redis-server database/redis/redis.conf

# Terminal 4: Ollama
ollama serve
```

## Project Structure

```
app/
├── web/                      # Next.js Frontend
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   ├── page.tsx     # Patient list (home)
│   │   │   └── patients/[id]/page.tsx  # Patient details
│   │   ├── components/      # React components
│   │   │   ├── AudioUploadDialog.tsx
│   │   │   ├── AudioRecorder.tsx
│   │   │   └── TranscriptEditor.tsx
│   │   ├── lib/
│   │   │   └── api.ts       # API client
│   │   └── theme/           # MUI theme
│   └── package.json
│
├── api/                     # Express Backend
│   ├── controllers/
│   │   ├── transcriptionController.js
│   │   └── validationController.js
│   ├── models/
│   │   ├── Patient.js
│   │   └── Transcript.js
│   ├── routes/
│   │   ├── patients.js
│   │   ├── transcripts.js
│   │   └── upload.js
│   ├── server.js
│   └── package.json
│
├── ai/                      # Python AI
│   ├── transcribe.py       # Whisper integration
│   ├── validate.py         # Ollama integration
│   ├── requirements.txt
│   └── prompts/            # AI prompts
│
└── database/
    └── redis/              # Redis config
```

## Notes

- Backend orchestrates AI and DB operations
- Frontend never calls AI directly
- Whisper runs locally via Python subprocess
- Ollama runs locally via CLI
- MongoDB Atlas stores permanent data
- Redis handles caching and job queues
- All transcriptions linked to patients
- Edit history preserved for audit trail

