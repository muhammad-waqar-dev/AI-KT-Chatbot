import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const api = {
  getMasters: () => axios.get(`${API_BASE_URL}/masters`),
  createMaster: (name, iconUrl) => axios.post(`${API_BASE_URL}/masters`, { name, iconUrl }),
  updateMaster: (oldName, data) => axios.put(`${API_BASE_URL}/masters/${encodeURIComponent(oldName)}`, data),
  deleteMaster: (name) => axios.delete(`${API_BASE_URL}/masters/${encodeURIComponent(name)}`),
  getDocuments: (masterId) => axios.get(`${API_BASE_URL}/masters/${masterId}/documents`),
  deleteDocument: (masterId, docId) => axios.delete(`${API_BASE_URL}/masters/${masterId}/documents/${docId}`),
  downloadDocument: (masterId, docId) => axios.get(`${API_BASE_URL}/masters/${masterId}/documents/${docId}/download`, { responseType: 'blob' }),
  ingest: (formData) => axios.post(`${API_BASE_URL}/ingest`, formData),
  getChatStream: async (input, masterName, onToken, onDone, onError) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, masterName })
      });
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        lines.forEach(line => {
          if (line.startsWith('data:')) {
            const token = line.replace('data:', '');
            onToken(token);
          }
        });
      }
      onDone();
    } catch (error) {
      onError(error);
    }
  }
};

