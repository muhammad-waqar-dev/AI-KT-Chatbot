import React, { useState, useEffect } from 'react';
import { Scissors, FileText, Calendar, Hash, Cpu, ArrowLeft, Loader2, Search, Trash2, Eye, X } from 'lucide-react';
import { api } from '../services/api';
import ConfirmationModal from './ConfirmationModal';
import '../styles/FragmentationView.css';

const FragmentationView = ({ selectedMaster, selectedMasterId, setActiveView }) => {
  const [fragments, setFragments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchText] = useState('');
  const [selectedFrag, setSelectedFrag] = useState(null); // For Detail View
  const [selectedIds, setSelectedIds] = useState([]); // For checkboxes
  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    id: null, 
    onConfirm: () => {} 
  });

  useEffect(() => {
    if (selectedMasterId) {
      fetchFragmentation();
      setSelectedIds([]); // Reset selection when master changes
    }
  }, [selectedMasterId]);

  const fetchFragmentation = async () => {
    setIsLoading(true);
    try {
      const res = await api.getFragmentation(selectedMasterId);
      setFragments(res.data);
    } catch (err) {
      console.error('Failed to fetch fragments', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredFragments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFragments.map(f => f.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDeleteFragment = (id) => {
    setConfirmModal({
      isOpen: true,
      id: id,
      title: 'Delete Knowledge Fragment',
      message: 'Are you sure you want to delete this specific chunk from the vector database? This cannot be undone.',
      onConfirm: async () => {
        try {
          await api.deleteFragments([id]);
          setFragments(fragments.filter(f => f.id !== id));
          setSelectedIds(prev => prev.filter(i => i !== id));
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          console.error('Delete failed', err);
          alert('Failed to delete fragment.');
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;

    setConfirmModal({
      isOpen: true,
      title: 'Bulk Delete Fragments',
      message: `Are you sure you want to delete ${selectedIds.length} selected chunks? This action is permanent.`,
      onConfirm: async () => {
        try {
          await api.deleteFragments(selectedIds);
          setFragments(fragments.filter(f => !selectedIds.includes(f.id)));
          setSelectedIds([]);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          console.error('Bulk delete failed', err);
          alert('Failed to perform bulk delete.');
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const filteredFragments = fragments.filter(f => 
    (f.text?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (f.fileName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="frag-view-container">
      <div className="frag-view-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => setActiveView('chat')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="frag-title">Knowledge Fragmentation</h2>
            <p className="frag-subtitle">Analyzing <strong>{fragments.length}</strong> vector points for {selectedMaster}</p>
          </div>
        </div>
        <div className="header-right">
          {selectedIds.length > 0 && (
            <button className="bulk-delete-btn" onClick={handleBulkDelete}>
              <Trash2 size={18} />
              Delete Selected ({selectedIds.length})
            </button>
          )}
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search within chunks..." 
              value={searchTerm}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        {isLoading ? (
          <div className="loading-state">
            <Loader2 size={40} className="spin" />
            <p>Scanning vector database...</p>
          </div>
        ) : filteredFragments.length === 0 ? (
          <div className="empty-state">
            <Scissors size={48} />
            <p>No fragments found matching your search.</p>
          </div>
        ) : (
          <table className="frag-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === filteredFragments.length && filteredFragments.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th style={{ width: '15%' }}>Document</th>
                <th style={{ width: '15%' }}>Uploaded Date</th>
                <th style={{ width: '30%' }}>Chunk Text</th>
                <th>Metadata</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFragments.map((frag, idx) => (
                <tr key={frag.id || idx} className={selectedIds.includes(frag.id) ? 'row-selected' : ''}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(frag.id)}
                      onChange={() => toggleSelect(frag.id)}
                    />
                  </td>
                  <td>
                    <div className="file-info">
                      <FileText size={16} color="#3b82f6" />
                      <span className="file-name">{frag.fileName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      <Calendar size={14} />
                      <span>{formatDate(frag.uploadedDate)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="chunk-text-box" title={frag.text}>
                      {frag.text}
                    </div>
                  </td>
                  <td>
                    <div className="meta-grid">
                      <div className="meta-item">
                        <Hash size={12} />
                        <span>Size: {frag.chunkSize}</span>
                      </div>
                      <div className="meta-badge">{frag.docType}</div>
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="action-group">
                      <button 
                        className="action-btn view" 
                        onClick={() => setSelectedFrag(frag)}
                        title="View Full Detail"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        className="action-btn delete" 
                        onClick={() => handleDeleteFragment(frag.id)}
                        title="Delete Fragment"
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

      {/* Detail View Modal */}
      {selectedFrag && (
        <div className="modal-overlay" onClick={() => setSelectedFrag(null)}>
          <div className="modal-container detail-modal animate-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Fragment Detail</h3>
              <button onClick={() => setSelectedFrag(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <label>DOCUMENT INFO</label>
                <p><strong>{selectedFrag.fileName}</strong> ({formatDate(selectedFrag.uploadedDate)})</p>
              </div>
              <div className="detail-section">
                <label>CHUNK TEXT</label>
                <div className="full-text-box">{selectedFrag.text}</div>
              </div>
              <div className="detail-section">
                <label>EMBEDDING VECTOR ({selectedFrag.dimension} dimensions)</label>
                <div className="vector-box">
                  [ {selectedFrag.embeddings?.map(v => v.toFixed(6)).join(', ')} ]
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default FragmentationView;

