'use client'

import { useState } from 'react'
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
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { api } from '@/lib/api'

interface AudioUploadDialogProps {
  open: boolean
  onClose: () => void
  patientId: string
  onSuccess: () => void
}

export default function AudioUploadDialog({
  open,
  onClose,
  patientId,
  onSuccess,
}: AudioUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [transcriptResult, setTranscriptResult] = useState<any>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setUploading(true)
      setError(null)
      setTranscriptResult(null)
      setProgress(30)

      const result = await api.transcripts.uploadAudio(patientId, selectedFile)
      setTranscriptResult(result)
      
      setProgress(100)
      if (result.success) {
        setTimeout(() => {
          onSuccess()
          handleClose()
        }, 1500)
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed')
      setProgress(0)
      setTranscriptResult(null)
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setError(null)
    setProgress(0)
    setTranscriptResult(null)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Audio File</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {transcriptResult && transcriptResult.success && (
            <Alert 
              severity='success' 
              sx={{ mb: 2 }}
            >
              ✓ Transcribed successfully!
            </Alert>
          )}

          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            fullWidth
            sx={{ mb: 2 }}
          >
            Select Audio File
            <input
              type="file"
              hidden
              accept="audio/mp3,audio/wav,audio/m4a,audio/ogg,audio/flac"
              onChange={handleFileSelect}
            />
          </Button>

          {selectedFile && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Selected: {selectedFile.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            </Box>
          )}

          {uploading && (
            <Box sx={{ width: '100%', mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Processing transcription...
              </Typography>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
          )}

          <Typography variant="caption" color="text.secondary">
            Supported formats: MP3, WAV, M4A, OGG, FLAC
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        {!transcriptResult && (
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!selectedFile || uploading}
          >
            Upload & Transcribe
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
