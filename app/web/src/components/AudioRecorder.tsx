'use client'

import { useState, useRef } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  IconButton,
} from '@mui/material'
import MicIcon from '@mui/icons-material/Mic'
import StopIcon from '@mui/icons-material/Stop'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import { api } from '@/lib/api'

interface AudioRecorderProps {
  open: boolean
  onClose: () => void
  patientId: string
  onSuccess: () => void
}

export default function AudioRecorder({
  open,
  onClose,
  patientId,
  onSuccess,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [transcriptResult, setTranscriptResult] = useState<any>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (err) {
      setError('Failed to access microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const togglePlayback = () => {
    if (!audioBlob) return

    if (!audioRef.current) {
      audioRef.current = new Audio(URL.createObjectURL(audioBlob))
      audioRef.current.onended = () => setIsPlaying(false)
    }

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleUpload = async () => {
    if (!audioBlob) return

    try {
      setUploading(true)
      setError(null)
      setTranscriptResult(null)

      const file = new File([audioBlob], `recording-${Date.now()}.webm`, {
        type: 'audio/webm',
      })

      const result = await api.transcripts.uploadAudio(patientId, file)
      setTranscriptResult(result)
      
      if (result.success) {
        setTimeout(() => {
          onSuccess()
          handleClose()
        }, 1500)
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed')
      setTranscriptResult(null)
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    if (isRecording) {
      stopRecording()
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setAudioBlob(null)
    setIsPlaying(false)
    setError(null)
    setRecordingTime(0)
    onClose()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Record Audio</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {error}
            </Alert>
          )}

          {transcriptResult && transcriptResult.success && (
            <Alert 
              severity='success' 
              sx={{ mb: 2, width: '100%' }}
            >
              ✓ Transcribed successfully!
            </Alert>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            {!audioBlob ? (
              <IconButton
                color={isRecording ? 'error' : 'primary'}
                onClick={isRecording ? stopRecording : startRecording}
                sx={{ width: 80, height: 80 }}
              >
                {isRecording ? <StopIcon sx={{ fontSize: 48 }} /> : <MicIcon sx={{ fontSize: 48 }} />}
              </IconButton>
            ) : (
              <IconButton
                color="primary"
                onClick={togglePlayback}
                sx={{ width: 80, height: 80 }}
              >
                {isPlaying ? <PauseIcon sx={{ fontSize: 48 }} /> : <PlayArrowIcon sx={{ fontSize: 48 }} />}
              </IconButton>
            )}
          </Box>

          <Typography variant="h6" sx={{ mb: 2 }}>
            {isRecording ? `Recording: ${formatTime(recordingTime)}` : audioBlob ? 'Recording Ready' : 'Click to Start Recording'}
          </Typography>

          {uploading && (
            <Box sx={{ width: '100%', mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Processing transcription...
              </Typography>
              <LinearProgress />
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={uploading || isRecording}>
          Cancel
        </Button>
        {audioBlob && !transcriptResult && (
          <Button onClick={() => setAudioBlob(null)} disabled={uploading}>
            Re-record
          </Button>
        )}
        {!transcriptResult && (
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!audioBlob || uploading}
          >
            Upload & Transcribe
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
