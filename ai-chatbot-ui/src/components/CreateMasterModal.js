import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const CreateMasterModal = ({ isModalOpen, setIsModalOpen, newMasterName, setNewMasterName, newMasterUser, setNewMasterUser, handleCreateMaster, isIngesting, ingestStatus, isEditMode, editMasterStatus, setEditMasterStatus }) => {
  if (!isModalOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(20, 18, 59, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }}>
      <form onSubmit={handleCreateMaster} style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '20px', width: '450px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        <h3 style={{ marginBottom: '8px', fontSize: '1.5rem', fontWeight: 800, color: 'rgb(20, 18, 59)' }}>{isEditMode ? 'Edit Master Details' : 'New Knowledge Master'}</h3>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>{isEditMode ? 'Update the name or status of your knowledge base.' : 'Create a separate brain for a new application or domain.'}</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgb(20, 18, 59)' }}>MASTER NAME</label>
          <input type="text" value={newMasterName} onChange={e => setNewMasterName(e.target.value)} placeholder="e.g. Invoicing App" style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '1rem' }} autoFocus />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgb(20, 18, 59)' }}>OWNER NAME</label>
          <input type="text" value={newMasterUser} onChange={e => setNewMasterUser(e.target.value)} placeholder="e.g. John Doe" style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '1rem' }} />
        </div>

        {isEditMode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, color: 'rgb(20, 18, 59)', fontSize: '0.9rem' }}>Status</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Deactivating will hide this master from the list.</p>
            </div>
            <button 
              type="button"
              onClick={() => setEditMasterStatus(!editMasterStatus)}
              style={{
                width: '50px', height: '26px', borderRadius: '25px', padding: '2px', border: 'none', cursor: 'pointer',
                backgroundColor: editMasterStatus ? 'rgb(36, 252, 176)' : '#cbd5e1',
                display: 'flex', alignItems: 'center', transition: 'all 0.2s', position: 'relative'
              }}
            >
              <div style={{ 
                width: '22px', height: '22px', backgroundColor: '#fff', borderRadius: '50%', 
                transition: 'transform 0.2s', transform: editMasterStatus ? 'translateX(24px)' : 'translateX(0)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }} />
            </button>
          </div>
        )}

        {ingestStatus && (
          <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: ingestStatus.type === 'success' ? '#f0fdf4' : '#fef2f2', color: ingestStatus.type === 'success' ? '#166534' : '#991b1b', border: `1px solid ${ingestStatus.type === 'success' ? '#bbf7d0' : '#fecaca'}`, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9rem', marginBottom: '20px' }}>
            {ingestStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {ingestStatus.message}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '12px 20px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 700, color: '#64748b' }}>Cancel</button>
          <button type="submit" disabled={!newMasterName.trim() || isIngesting} style={{ backgroundColor: newMasterName.trim() && !isIngesting ? 'rgb(36, 252, 176)' : '#f1f5f9', color: newMasterName.trim() && !isIngesting ? 'rgb(20, 18, 59)' : '#94a3b8', padding: '12px 32px', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>
            {isIngesting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Master' : 'Create Master')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMasterModal;

