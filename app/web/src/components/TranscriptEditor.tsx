'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Tabs,
  Tab,
  Alert,
  Chip,
} from '@mui/material'
import { api } from '@/lib/api'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  )
}

interface TranscriptEditorProps {
  open: boolean
  onClose: () => void
  transcript: any
  onSave: () => void
}

export default function TranscriptEditor({
  open,
  onClose,
  transcript,
  onSave,
}: TranscriptEditorProps) {
  const [editedText, setEditedText] = useState('')
  const [tabValue, setTabValue] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (transcript) {
      setEditedText(transcript.finalTranscript || transcript.validatedTranscript || transcript.whisperTranscript || '')
    }
  }, [transcript])

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      await api.transcripts.update(transcript._id, {
        finalTranscript: editedText,
        editedBy: 'Doctor',
      })

      onSave()
    } catch (err: any) {
      setError(err.message || 'Failed to save transcript')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setTabValue(0)
    setError(null)
    onClose()
  }

  if (!transcript) return null

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Transcript Editor</Typography>
          <Chip
            label={transcript.status}
            size="small"
            color={transcript.status === 'completed' ? 'success' : 'default'}
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label="Edit" />
            <Tab label="Whisper Original" />
            <Tab label="AI Validated" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <TextField
            fullWidth
            multiline
            rows={12}
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            placeholder="Edit transcript..."
            variant="outlined"
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Last updated: {new Date(transcript.updatedAt).toLocaleString()}
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box
            sx={{
              p: 2,
              bgcolor: 'grey.100',
              borderRadius: 1,
              maxHeight: 400,
              overflow: 'auto',
            }}
          >
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {transcript.whisperTranscript || 'No Whisper transcript available'}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Original transcription from Whisper AI
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box
            sx={{
              p: 2,
              bgcolor: 'grey.100',
              borderRadius: 1,
              maxHeight: 400,
              overflow: 'auto',
            }}
          >
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {transcript.validatedTranscript || 'No validated transcript available'}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Validated and corrected by Ollama
          </Typography>
        </TabPanel>

        {transcript.editHistory && transcript.editHistory.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Edit History
            </Typography>
            {transcript.editHistory.map((edit: any, idx: number) => (
              <Typography key={idx} variant="caption" color="text.secondary" display="block">
                {new Date(edit.editedAt).toLocaleString()} by {edit.editedBy}
              </Typography>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || !editedText.trim()}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  )
}
