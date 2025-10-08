'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Dialog,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import MicIcon from '@mui/icons-material/Mic'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import RefreshIcon from '@mui/icons-material/Refresh'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { api } from '@/lib/api'
import AudioUploadDialog from '@/components/AudioUploadDialog'
import AudioRecorder from '@/components/AudioRecorder'
import TranscriptReview from '@/components/TranscriptReview'

export default function PatientDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string

  const [patient, setPatient] = useState<any>(null)
  const [transcripts, setTranscripts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [recordDialogOpen, setRecordDialogOpen] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedTranscript, setSelectedTranscript] = useState<any>(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' })
  const [retrying, setRetrying] = useState<string | null>(null)

  useEffect(() => {
    loadPatientData()
  }, [patientId])

  const loadPatientData = async () => {
    try {
      setLoading(true)
      const [patientData, transcriptsData] = await Promise.all([
        api.patients.getById(patientId),
        api.patients.getTranscripts(patientId),
      ])
      setPatient(patientData)
      setTranscripts(transcriptsData)
    } catch (error) {
      console.error('Failed to load patient data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSuccess = () => {
    setUploadDialogOpen(false)
    loadPatientData()
  }

  const handleRecordSuccess = () => {
    setRecordDialogOpen(false)
    loadPatientData()
  }

  const handleReviewTranscript = (transcript: any) => {
    setSelectedTranscript(transcript)
    setReviewDialogOpen(true)
  }

  const handleDeleteTranscript = async (transcriptId: string) => {
    if (confirm('Are you sure you want to delete this transcript?')) {
      try {
        await api.transcripts.delete(transcriptId)
        loadPatientData()
      } catch (error) {
        console.error('Failed to delete transcript:', error)
      }
    }
  }

  const handleRetryTranscription = async (transcriptId: string) => {
    setRetrying(transcriptId)
    setSnackbar({ open: true, message: 'Redoing transcription...', severity: 'info' as any })
    try {
      const result = await api.transcripts.retryTranscription(transcriptId)
      if (result.success) {
        setSnackbar({ open: true, message: '✓ Transcription completed successfully!', severity: 'success' })
      } else {
        setSnackbar({ open: true, message: `Transcription failed: ${result.error || 'Unknown error'}`, severity: 'error' })
      }
      await loadPatientData()
    } catch (error) {
      console.error('Failed to redo transcription:', error)
      setSnackbar({ open: true, message: 'Failed to redo transcription. Check console for details.', severity: 'error' })
    } finally {
      setRetrying(null)
    }
  }

  if (loading || !patient) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading patient details...</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/')}
          sx={{ mb: 2 }}
        >
          Back to Patients
        </Button>
        <Typography variant="h4" component="h1">
          {patient.firstName} {patient.lastName}
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {patient.dateOfBirth && (
                  <Chip label={`DOB: ${new Date(patient.dateOfBirth).toLocaleDateString()}`} />
                )}
                {patient.gender && (
                  <Chip label={patient.gender} />
                )}
                {patient.medicalRecordNumber && (
                  <Chip label={`MRN: ${patient.medicalRecordNumber}`} variant="outlined" />
                )}
                <Chip
                  label={patient.isActive ? 'Active' : 'Inactive'}
                  color={patient.isActive ? 'success' : 'default'}
                />
              </Box>
              {(patient.email || patient.phone) && (
                <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {patient.email && (
                    <Typography variant="body2" color="text.secondary">
                      📧 {patient.email}
                    </Typography>
                  )}
                  {patient.phone && (
                    <Typography variant="body2" color="text.secondary">
                      📞 {patient.phone}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
            <Box sx={{ minWidth: { xs: '100%', md: '200px' } }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                <Typography variant="h4" color="primary">
                  {transcripts.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Transcriptions
                </Typography>
                {transcripts.length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Last: {new Date(transcripts[0].createdAt).toLocaleDateString()}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Transcriptions
            </Typography>
            <Box>
              <Button
                variant="outlined"
                startIcon={<MicIcon />}
                onClick={() => setRecordDialogOpen(true)}
                sx={{ mr: 1 }}
              >
                Record
              </Button>
              <Button
                variant="contained"
                startIcon={<UploadFileIcon />}
                onClick={() => setUploadDialogOpen(true)}
              >
                Upload
              </Button>
            </Box>
          </Box>

          {transcripts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No transcriptions yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload or record audio to get started
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>File</strong></TableCell>
                    <TableCell><strong>Transcript Preview</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="right"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transcripts.map((transcript) => (
                    <TableRow key={transcript._id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(transcript.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(transcript.createdAt).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {transcript.fileName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 400 }}>
                          {transcript.finalTranscript || transcript.validatedTranscript || transcript.whisperTranscript}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Chip
                            label={transcript.status}
                            size="small"
                            color={
                              transcript.status === 'completed' ? 'success' : 
                              transcript.status === 'reviewed' ? 'primary' : 
                              transcript.status === 'failed' ? 'error' :
                              'default'
                            }
                          />
                          {transcript.status === 'failed' && transcript.metadata?.error && (
                            <Typography variant="caption" color="error" sx={{ fontSize: '0.7rem' }}>
                              Transcription failed
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color={transcript.status === 'failed' ? 'error' : 'default'}
                          onClick={() => handleRetryTranscription(transcript._id)}
                          title="Redo Transcription"
                          disabled={retrying === transcript._id}
                        >
                          {retrying === transcript._id ? <CircularProgress size={20} /> : <RefreshIcon />}
                        </IconButton>
                        {transcript.status !== 'failed' && (
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleReviewTranscript(transcript)}
                            title="Review"
                            disabled={retrying === transcript._id}
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteTranscript(transcript._id)}
                          title="Delete"
                          disabled={retrying === transcript._id}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <AudioUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        patientId={patientId}
        onSuccess={handleUploadSuccess}
      />

      <AudioRecorder
        open={recordDialogOpen}
        onClose={() => setRecordDialogOpen(false)}
        patientId={patientId}
        onSuccess={handleRecordSuccess}
      />

      {selectedTranscript && (
        <TranscriptReview
          open={reviewDialogOpen}
          onClose={() => {
            setReviewDialogOpen(false)
            setSelectedTranscript(null)
          }}
          transcript={selectedTranscript}
          onSave={() => {
            setReviewDialogOpen(false)
            setSelectedTranscript(null)
            loadPatientData()
          }}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}
