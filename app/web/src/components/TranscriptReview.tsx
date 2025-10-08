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
  const [saving, setSaving] = useState(false)
  const [editingWordIndex, setEditingWordIndex] = useState(-1)
  const [editingWordValue, setEditingWordValue] = useState('')
  const [words, setWords] = useState<Word[]>([])
  const [textareaValue, setTextareaValue] = useState('')

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (transcript && open) {
      const originalWords = transcript.wordTimestamps || []
      const finalText = transcript.finalTranscript || transcript.validatedTranscript || transcript.whisperTranscript || ''
      
      // If finalTranscript exists and differs from the original, reconstruct words from it
      const originalText = originalWords.map(w => w.word).join(' ')
      if (finalText !== originalText && originalWords.length > 0) {
        // Split finalTranscript by spaces and map to word objects, keeping original timestamps
        const finalWords = finalText.split(' ')
        const reconstructedWords = finalWords.map((word, index) => ({
          word: word,
          start: originalWords[index]?.start || 0,
          end: originalWords[index]?.end || 0
        }))
        setWords(reconstructedWords)
      } else {
        setWords(originalWords)
      }
      
      setEditedText(finalText)
      setTextareaValue(finalText)
      
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

  const handleWordClick = (word: Word, index: number, shouldEdit: boolean = true) => {
    if (audioRef.current) {
      // Pause playback
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      }
      // Jump to word timestamp
      audioRef.current.currentTime = word.start
      setCurrentTime(word.start)
    }
    // Start editing this word only if requested (for top navigator)
    if (shouldEdit) {
      setEditingWordIndex(index)
      setEditingWordValue(word.word)
    }
  }

  const handleTextareaBlur = async () => {
    if (textareaValue === editedText) return // No changes
    
    setEditedText(textareaValue)
    
    // Save to database
    try {
      setSaving(true)
      await api.transcripts.update(transcript._id, {
        finalTranscript: textareaValue,
        editedBy: 'Doctor',
        status: 'reviewed',
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'Doctor'
      })
    } catch (error) {
      console.error('Failed to save textarea edit:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleWordBlur = async () => {
    if (editingWordIndex === -1) return
    
    // Update the word in the words array
    const updatedWords = [...words]
    updatedWords[editingWordIndex] = {
      ...updatedWords[editingWordIndex],
      word: editingWordValue
    }
    setWords(updatedWords)
    
    // Update the edited text and textarea
    const newText = updatedWords.map(w => w.word).join(' ')
    setEditedText(newText)
    setTextareaValue(newText)
    
    // Save to database
    try {
      setSaving(true)
      await api.transcripts.update(transcript._id, {
        finalTranscript: newText,
        editedBy: 'Doctor',
        status: 'reviewed',
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'Doctor'
      })
      // Successfully saved
    } catch (error) {
      console.error('Failed to save word edit:', error)
    } finally {
      setSaving(false)
      setEditingWordIndex(-1)
      setEditingWordValue('')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setIsPlaying(false)
    onSave() // Refresh parent data
    onClose()
  }

  if (!transcript) return null

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Review & Edit Transcription</Typography>
          <Chip
            label={transcript.status}
            size="small"
            color={transcript.status === 'completed' ? 'success' : 'default'}
          />
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

        <Box>
          <TextField
            fullWidth
            multiline
            rows={15}
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
            onBlur={handleTextareaBlur}
            placeholder="Edit transcript..."
            variant="outlined"
            label="Edit Transcript"
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Edit the transcript freely. Changes save automatically when you click away.
          </Typography>
          {saving && (
            <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
              Saving...
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={saving} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
