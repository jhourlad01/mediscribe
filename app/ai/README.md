# MediScribe AI

Python scripts for medical transcription using Whisper and Ollama.

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Install Ollama:
- Download from https://ollama.ai
- Pull the model: `ollama pull mistral`

## Scripts

### transcribe.py
Transcribes audio files using OpenAI Whisper.

**Usage:**
```bash
python transcribe.py <audio_file_path>
```

**Environment Variables:**
- `WHISPER_MODEL`: Model size (tiny, base, small, medium, large) - default: small

### validate.py
Validates and corrects transcriptions using Ollama.

**Usage:**
```bash
python validate.py "<transcription_text>"
```

**Environment Variables:**
- `OLLAMA_MODEL`: Ollama model name - default: mistral

## Models

### Whisper Models
- **tiny**: Fastest, least accurate
- **base**: Fast, good for testing
- **small**: Balanced (recommended)
- **medium**: More accurate, slower
- **large**: Most accurate, slowest

### Ollama Models
- **mistral**: General purpose (recommended)
- **llama2**: Alternative option
- **medalpaca**: Medical-specific (if available)

