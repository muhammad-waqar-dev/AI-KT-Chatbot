import React from 'react';
import { Upload, CheckCircle2, AlertCircle, FileText, X } from 'lucide-react';
import '../styles/TrainingView.css';

const TrainingView = ({ 
  selectedMaster, 
  handleIngest, 
  ingestText, 
  setIngestText, 
  ingestFile, 
  setIngestFile, 
  isIngesting, 
  ingestStatus, 
  setActiveView 
}) => {
  return (
    <div className="training-view-container">
      <div className="training-view-wrapper">
        <div className="training-view-header">
          <h2 className="training-view-title">Training Ground</h2>
          <p className="training-view-subtitle">Enhance the knowledge of <strong>{selectedMaster}</strong></p>
        </div>
        
        <form onSubmit={handleIngest} className="training-form">
          
          <div className="form-group">
            <label className="form-label">UPLOAD DOCUMENTS</label>
            <div className={`upload-box ${ingestFile ? 'has-file' : ''}`}>
              <input 
                type="file" 
                id="update-file" 
                hidden 
                onChange={e => setIngestFile(e.target.files[0])} 
                accept=".pdf,.doc,.docx,.txt,.md,.html" 
              />
              <label htmlFor="update-file" className="upload-label">
                <div className="upload-icon-wrapper">
                  {ingestFile ? <FileText size={20} color="rgb(36, 252, 176)" /> : <Upload size={20} color="#94a3b8" />}
                </div>
                <div className="upload-text">
                  <p className="upload-file-name">
                    {ingestFile ? ingestFile.name : 'Choose a file to upload'}
                  </p>
                  <p className="upload-hint">
                    PDF, Word, TXT (Max 50MB)
                  </p>
                </div>
              </label>
              {ingestFile && (
                <button 
                  className="remove-file-btn"
                  onClick={(e) => { e.preventDefault(); setIngestFile(null); }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">PASTE TEXT</label>
            <textarea 
              className="training-textarea"
              value={ingestText} 
              onChange={e => setIngestText(e.target.value)} 
              placeholder="Paste relevant notes or documentation here..." 
            />
          </div>

          {ingestStatus && (
            <div className={`status-message ${ingestStatus.type}`}>
              {ingestStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {ingestStatus.message}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel"
              onClick={() => setActiveView('chat')} 
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isIngesting || (!ingestFile && !ingestText.trim())} 
              className="btn-submit"
            >
              {isIngesting ? 'Syncing...' : 'Update Brain'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainingView;
