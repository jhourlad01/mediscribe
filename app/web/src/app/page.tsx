'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { api } from '@/lib/api'

export default function PatientsPage() {
  const router = useRouter()
  const [patients, setPatients] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      setLoading(true)
      const data = await api.patients.getAll()
      setPatients(data)
    } catch (error) {
      console.error('Failed to load patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    try {
      const data = await api.patients.getAll(search)
      setPatients(data)
    } catch (error) {
      console.error('Search failed:', error)
    }
  }

  const handleCreatePatient = async () => {
    try {
      const cleanedData = Object.fromEntries(
        Object.entries(newPatient).filter(([_, v]) => v !== '')
      )
      const patient = await api.patients.create(cleanedData)
      setOpenDialog(false)
      setNewPatient({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        email: '',
        phone: '',
      })
      router.push(`/patients/${patient._id}`)
    } catch (error) {
      console.error('Failed to create patient:', error)
    }
  }

  const filteredPatients = search
    ? patients.filter(p => 
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        p.medicalRecordNumber?.toLowerCase().includes(search.toLowerCase())
      )
    : patients

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Patients
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          New Patient
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search patients by name or MRN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
      </Box>

      {loading ? (
        <Typography>Loading patients...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Contact</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      No patients found. Click "New Patient" to add one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow
                    key={patient._id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/patients/${patient._id}`)}
                  >
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {patient.firstName} {patient.lastName}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        {patient.dateOfBirth && (
                          <Chip
                            label={`DOB: ${new Date(patient.dateOfBirth).toLocaleDateString()}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {patient.medicalRecordNumber && (
                          <Chip
                            label={`MRN: ${patient.medicalRecordNumber}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {patient.email && (
                        <Typography variant="body2">{patient.email}</Typography>
                      )}
                      {patient.phone && (
                        <Typography variant="body2" color="text.secondary">
                          {patient.phone}
                        </Typography>
                      )}
                      {!patient.email && !patient.phone && (
                        <Typography variant="body2" color="text.secondary">
                          No contact info
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={patient.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={patient.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/patients/${patient._id}`)
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Patient</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="First Name"
              required
              value={newPatient.firstName}
              onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
            />
            <TextField
              label="Last Name"
              required
              value={newPatient.lastName}
              onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
            />
            <TextField
              label="Date of Birth"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={newPatient.dateOfBirth}
              onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
            />
            <TextField
              label="Email"
              type="email"
              value={newPatient.email}
              onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
            />
            <TextField
              label="Phone"
              value={newPatient.phone}
              onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreatePatient}
            variant="contained"
            disabled={!newPatient.firstName || !newPatient.lastName}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}