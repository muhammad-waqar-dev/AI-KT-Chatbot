import React, { useState, useEffect } from 'react';
import { FileText, Trash2, Calendar, File, ArrowLeft, Loader2, Download } from 'lucide-react';
import { api } from '../services/api';
import ConfirmationModal from './ConfirmationModal';
import '../styles/DocumentsView.css';

const DocumentsView = ({ selectedMaster, selectedMasterId, setActiveView, activeView }) => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    onConfirm: () => {} 
  });

  useEffect(() => {
    if (selectedMasterId && activeView === 'documents') {
      fetchDocuments();
    }
  }, [selectedMasterId, activeView]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await api.getDocuments(selectedMasterId);
      setDocuments(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch documents', err);
      setError('Could not load documents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (id, fileName) => {
    setIsDownloading(id);
    try {
      const response = await api.downloadDocument(selectedMasterId, id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
      alert('Failed to download document.');
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDelete = (id, fileName) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Document',
      message: `Are you sure you want to remove "${fileName}" from the knowledge base?`,
      onConfirm: async () => {
        try {
          await api.deleteDocument(selectedMasterId, id);
          setDocuments(documents.filter(doc => doc.id !== id));
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          console.error('Delete failed', err);
          alert('Failed to delete document.');
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="documents-view-container">
      <div className="documents-view-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => setActiveView('chat')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="documents-title">Knowledge Base</h2>
            <p className="documents-subtitle">Managing documents for <strong>{selectedMaster}</strong></p>
          </div>
        </div>
        <button className="refresh-btn" onClick={fetchDocuments} disabled={isLoading}>
          {isLoading ? <Loader2 size={18} className="spin" /> : 'Refresh'}
        </button>
      </div>

      <div className="table-wrapper">
        {isLoading ? (
          <div className="loading-state">
            <Loader2 size={40} className="spin" />
            <p>Loading documents...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchDocuments}>Retry</button>
          </div>
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <File size={48} />
            <p>No documents found for this master.</p>
            <button onClick={() => setActiveView('update')}>Upload Knowledge</button>
          </div>
        ) : (
          <table className="documents-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Type</th>
                <th>Uploaded Date</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <div className="file-name-cell">
                      <FileText size={18} className="file-icon" />
                      <span>{doc.fileName}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`type-badge ${doc.docType.toLowerCase()}`}>
                      {doc.docType.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="date-cell">
                      <Calendar size={14} />
                      <span>{formatDate(doc.createdAt)}</span>
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="action-group">
                      <button 
                        className="action-btn download" 
                        onClick={() => handleDownload(doc.id, doc.fileName)}
                        disabled={isDownloading === doc.id}
                        title="Download Document"
                      >
                        {isDownloading === doc.id ? <Loader2 size={18} className="spin" /> : <Download size={18} />}
                      </button>
                      <button 
                        className="action-btn delete" 
                        onClick={() => handleDelete(doc.id, doc.fileName)}
                        title="Delete Document"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default DocumentsView;

