'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  LinearProgress,
  IconButton,
  Slider,
  Chip,
  TextField,
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import SaveIcon from '@mui/icons-material/Save'
import { api } from '@/lib/api'

interface Word {
  word: string
  start: number
  end: number
}

interface TranscriptReviewProps {
  open: boolean
  onClose: () => void
  transcript: any
  onSave: () => void
}

export default function TranscriptReview({
  open,
  onClose,
  transcript,
  onSave,
}: TranscriptReviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [activeWordIndex, setActiveWordIndex] = useState(-1)
  const [editedText, setEditedText] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const wordsRef = useRef<Word[]>([])

  useEffect(() => {
    if (transcript && open) {
      wordsRef.current = transcript.wordTimestamps || []
      setEditedText(transcript.finalTranscript || transcript.validatedTranscript || transcript.whisperTranscript || '')
      
      if (audioRef.current) {
        audioRef.current.src = `${process.env.NEXT_PUBLIC_API_URL}/api/audio/${transcript._id}`
      } else {
        audioRef.current = new Audio(`${process.env.NEXT_PUBLIC_API_URL}/api/audio/${transcript._id}`)
        
        audioRef.current.addEventListener('loadedmetadata', () => {
          setDuration(audioRef.current?.duration || 0)
        })

        audioRef.current.addEventListener('timeupdate', () => {
          setCurrentTime(audioRef.current?.currentTime || 0)
          updateActiveWord(audioRef.current?.currentTime || 0)
        })

        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false)
        })
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [transcript, open])

  const updateActiveWord = (time: number) => {
    const words = wordsRef.current
    const index = words.findIndex((w) => time >= w.start && time <= w.end)
    setActiveWordIndex(index)
  }

  const togglePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value
      setCurrentTime(value)
    }
  }

  const handleVolumeChange = (value: number) => {
    setVolume(value)
    if (audioRef.current) {
      audioRef.current.volume = value
    }
  }

  const handleWordClick = (word: Word) => {
    if (audioRef.current) {
      audioRef.current.currentTime = word.start
      setCurrentTime(word.start)
      if (!isPlaying) {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await api.transcripts.update(transcript._id, {
        finalTranscript: editedText,
        editedBy: 'Doctor',
        status: 'reviewed',
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'Doctor'
      })
      onSave()
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setIsPlaying(false)
    setIsEditing(false)
    onClose()
  }

  if (!transcript) return null

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Review Transcription</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={transcript.status}
              size="small"
              color={transcript.status === 'completed' ? 'success' : 'default'}
            />
            <Button
              variant={isEditing ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'View Mode' : 'Edit Mode'}
            </Button>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Paper elevation={2} sx={{ p: 2, bgcolor: 'grey.900', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <IconButton
                onClick={togglePlayPause}
                sx={{ color: 'white' }}
                size="large"
              >
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>

              <Box sx={{ flex: 1 }}>
                <Slider
                  value={currentTime}
                  max={duration}
                  onChange={(_, value) => handleSeek(value as number)}
                  sx={{ color: 'primary.main' }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption">{formatTime(currentTime)}</Typography>
                  <Typography variant="caption">{formatTime(duration)}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: 120 }}>
                <VolumeUpIcon />
                <Slider
                  value={volume}
                  min={0}
                  max={1}
                  step={0.1}
                  onChange={(_, value) => handleVolumeChange(value as number)}
                  sx={{ color: 'primary.main' }}
                />
              </Box>
            </Box>
          </Paper>
        </Box>

        {!isEditing ? (
          <Paper
            elevation={1}
            sx={{
              p: 3,
              maxHeight: 400,
              overflow: 'auto',
              bgcolor: 'grey.50',
            }}
          >
            <Typography
              variant="body1"
              sx={{
                lineHeight: 2,
                fontSize: '1.1rem',
                wordSpacing: '0.3em',
              }}
            >
              {wordsRef.current.length > 0 ? (
                wordsRef.current.map((word, index) => (
                  <span
                    key={index}
                    onClick={() => handleWordClick(word)}
                    style={{
                      cursor: 'pointer',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      backgroundColor: index === activeWordIndex ? '#1976d2' : 'transparent',
                      color: index === activeWordIndex ? 'white' : 'inherit',
                      transition: 'all 0.2s',
                      display: 'inline-block',
                      margin: '0 2px',
                    }}
                    onMouseEnter={(e) => {
                      if (index !== activeWordIndex) {
                        e.currentTarget.style.backgroundColor = '#e3f2fd'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (index !== activeWordIndex) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    {word.word}
                  </span>
                ))
              ) : (
                <span>{editedText}</span>
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              💡 Click any word to jump to that part of the audio
            </Typography>
          </Paper>
        ) : (
          <Box>
            <TextField
              fullWidth
              multiline
              rows={15}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              placeholder="Edit transcript..."
              variant="outlined"
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Switch to View Mode to see word-by-word synchronized playback
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Close
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={saving || !editedText.trim()}
        >
          {saving ? 'Saving...' : 'Save & Mark Reviewed'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
