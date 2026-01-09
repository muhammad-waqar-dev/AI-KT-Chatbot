import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import '../styles/CreateMasterModal.css';

const CreateMasterModal = ({ 
  isModalOpen, 
  setIsModalOpen, 
  newMasterName, 
  setNewMasterName, 
  newMasterIconUrl,
  setNewMasterIconUrl,
  handleCreateMaster, 
  isIngesting, 
  ingestStatus, 
  isEditMode, 
  editMasterStatus, 
  setEditMasterStatus 
}) => {
  if (!isModalOpen) return null;

  return (
    <div className="modal-overlay">
      <form onSubmit={handleCreateMaster} className="modal-form">
        <h3>{isEditMode ? 'Edit Master Details' : 'New Knowledge Master'}</h3>
        <p>{isEditMode ? 'Update the name or status of your knowledge base.' : 'Create a separate brain for a new application or domain.'}</p>
        
        <div className="form-group">
          <label>MASTER NAME</label>
          <input 
            type="text" 
            value={newMasterName} 
            onChange={e => setNewMasterName(e.target.value)} 
            placeholder="e.g. Invoicing App" 
            autoFocus 
          />
        </div>

        <div className="form-group">
          <label>MASTER ICON URL</label>
          <input 
            type="text" 
            value={newMasterIconUrl} 
            onChange={e => setNewMasterIconUrl(e.target.value)} 
            placeholder="e.g. https://example.com/icon.png" 
          />
        </div>

        {isEditMode && (
          <div className="status-toggle-wrapper">
            <div className="status-toggle-info">
              <p className="status-label">Status</p>
              <p className="status-desc">Deactivating will hide this master from the list.</p>
            </div>
            <button 
              type="button"
              onClick={() => setEditMasterStatus(!editMasterStatus)}
              className={`toggle-btn ${editMasterStatus ? 'active' : 'inactive'}`}
            >
              <div className="toggle-circle" />
            </button>
          </div>
        )}

        {ingestStatus && (
          <div className={`modal-status-msg ${ingestStatus.type}`}>
            {ingestStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {ingestStatus.message}
          </div>
        )}

        <div className="modal-actions">
          <button 
            type="button" 
            className="modal-btn-cancel"
            onClick={() => setIsModalOpen(false)} 
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={!newMasterName.trim() || isIngesting} 
            className={`modal-btn-submit ${newMasterName.trim() && !isIngesting ? 'active' : 'disabled'}`}
          >
            {isIngesting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Master' : 'Create Master')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMasterModal;
