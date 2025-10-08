import sys
import json
import os
from pathlib import Path

try:
    import whisper
except ImportError:
    print(json.dumps({"error": "Whisper not installed. Run: pip install openai-whisper"}), file=sys.stderr)
    sys.exit(1)

def transcribe_audio(audio_path, model_name="base"):
    try:
        print(f"Checking audio file: {audio_path}", file=sys.stderr)
        print(f"File exists: {os.path.exists(audio_path)}", file=sys.stderr)
        print(f"Is file: {os.path.isfile(audio_path)}", file=sys.stderr)
        print(f"Current working directory: {os.getcwd()}", file=sys.stderr)
        
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")
        
        print(f"Loading Whisper model: {model_name}", file=sys.stderr)
        model = whisper.load_model(model_name)
        print(f"Transcribing audio...", file=sys.stderr)
        result = model.transcribe(audio_path, word_timestamps=True)
        print(f"Transcription complete!", file=sys.stderr)
        
        words_with_timestamps = []
        for segment in result.get("segments", []):
            if "words" in segment:
                for word in segment["words"]:
                    words_with_timestamps.append({
                        "word": word.get("word", "").strip(),
                        "start": word.get("start", 0),
                        "end": word.get("end", 0)
                    })
        
        return {
            "text": result["text"],
            "language": result.get("language", "unknown"),
            "segments": result.get("segments", []),
            "words": words_with_timestamps
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Audio file path required"}), file=sys.stderr)
        sys.exit(1)
    
    audio_path = sys.argv[1]
    model_name = os.getenv("WHISPER_MODEL", "small")
    
    result = transcribe_audio(audio_path, model_name)
    
    if "error" in result:
        print(json.dumps(result), file=sys.stderr)
        sys.exit(1)
    
    print(json.dumps(result))

