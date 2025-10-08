const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = {
  patients: {
    async getAll(search?: string, isActive?: boolean) {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (isActive !== undefined) params.append('isActive', String(isActive));
      
      const response = await fetch(`${API_URL}/api/patients?${params}`);
      if (!response.ok) throw new Error('Failed to fetch patients');
      return response.json();
    },

    async getById(id: string) {
      const response = await fetch(`${API_URL}/api/patients/${id}`);
      if (!response.ok) throw new Error('Failed to fetch patient');
      return response.json();
    },

    async create(data: any) {
      const response = await fetch(`${API_URL}/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create patient');
      return response.json();
    },

    async update(id: string, data: any) {
      const response = await fetch(`${API_URL}/api/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update patient');
      return response.json();
    },

    async delete(id: string) {
      const response = await fetch(`${API_URL}/api/patients/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete patient');
      return response.json();
    },

    async getTranscripts(id: string) {
      const response = await fetch(`${API_URL}/api/patients/${id}/transcripts`);
      if (!response.ok) throw new Error('Failed to fetch patient transcripts');
      return response.json();
    },
  },

  transcripts: {
    async uploadAudio(patientId: string, file: File) {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('patientId', patientId);

      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },

    async getAll() {
      const response = await fetch(`${API_URL}/api/transcripts`);
      if (!response.ok) throw new Error('Failed to fetch transcripts');
      return response.json();
    },

    async getById(id: string) {
      const response = await fetch(`${API_URL}/api/transcripts/${id}`);
      if (!response.ok) throw new Error('Failed to fetch transcript');
      return response.json();
    },

    async update(id: string, data: any) {
      const response = await fetch(`${API_URL}/api/transcripts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update transcript');
      return response.json();
    },

    async delete(id: string) {
      const response = await fetch(`${API_URL}/api/transcripts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete transcript');
      return response.json();
    },

    async retryTranscription(id: string) {
      const response = await fetch(`${API_URL}/api/transcripts/${id}/retry-transcription`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to retry transcription');
      return response.json();
    },
  },
};

