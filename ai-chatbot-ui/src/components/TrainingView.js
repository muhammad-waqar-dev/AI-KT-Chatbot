import React from 'react';
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react';

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
    <div style={{ flex: 1, overflowY: 'auto', padding: '60px 20px', backgroundColor: '#fff' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'rgb(20, 18, 59)', marginBottom: '12px' }}>Training Ground</h2>
          <p style={{ color: '#64748b' }}>Add documents or notes to improve the knowledge of <strong>{selectedMaster}</strong>.</p>
        </div>
        
        <form onSubmit={handleIngest} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'rgb(20, 18, 59)' }}>PASTE DOCUMENTATION</label>
            <textarea value={ingestText} onChange={e => setIngestText(e.target.value)} placeholder="Markdown or plain text works best..." style={{ width: '100%', height: '250px', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '1rem', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = 'rgb(36, 252, 176)'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'rgb(20, 18, 59)' }}>UPLOAD FILES</label>
            <div style={{ border: '2px dashed #e2e8f0', padding: '40px', borderRadius: '16px', textAlign: 'center', backgroundColor: '#f8fafc', transition: 'all 0.2s' }}>
              <input type="file" id="update-file" hidden onChange={e => setIngestFile(e.target.files[0])} accept=".pdf,.doc,.docx,.txt,.md,.html" />
              <label htmlFor="update-file" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '50%', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}><Upload size={32} color="rgb(36, 252, 176)" /></div>
                <div>
                  <p style={{ fontWeight: 700, color: 'rgb(20, 18, 59)', marginBottom: '4px' }}>{ingestFile ? ingestFile.name : 'Click to select or drop files'}</p>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>PDF, Word, TXT or MD (Max 50MB)</p>
                </div>
              </label>
            </div>
          </div>

          {ingestStatus && (
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: ingestStatus.type === 'success' ? '#f0fdf4' : '#fef2f2', color: ingestStatus.type === 'success' ? '#166534' : '#991b1b', border: `1px solid ${ingestStatus.type === 'success' ? '#bbf7d0' : '#fecaca'}`, display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600 }}>
              {ingestStatus.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              {ingestStatus.message}
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setActiveView('chat')} style={{ padding: '12px 24px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, color: '#64748b' }}>Cancel</button>
            <button type="submit" disabled={isIngesting || (!ingestFile && !ingestText.trim())} style={{ padding: '12px 32px', backgroundColor: isIngesting ? '#f1f5f9' : 'rgb(36, 252, 176)', color: 'rgb(20, 18, 59)', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 800, boxShadow: '0 4px 12px rgba(36, 252, 176, 0.2)' }}>{isIngesting ? 'Syncing Knowledge...' : 'Update Master Brain'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainingView;

