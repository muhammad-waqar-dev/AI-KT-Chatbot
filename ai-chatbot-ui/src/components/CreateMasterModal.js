import React from 'react';

const CreateMasterModal = ({ isModalOpen, setIsModalOpen, newMasterName, setNewMasterName, handleIngest }) => {
  if (!isModalOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(20, 18, 59, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }}>
      <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '20px', width: '450px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        <h3 style={{ marginBottom: '8px', fontSize: '1.5rem', fontWeight: 800, color: 'rgb(20, 18, 59)' }}>New Knowledge Master</h3>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>Create a separate brain for a new application or domain.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgb(20, 18, 59)' }}>MASTER NAME</label>
          <input type="text" value={newMasterName} onChange={e => setNewMasterName(e.target.value)} placeholder="e.g. Invoicing App" style={{ width: '100%', padding: '14px', marginBottom: '24px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '1rem' }} autoFocus />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={() => setIsModalOpen(false)} style={{ padding: '12px 20px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 700, color: '#64748b' }}>Cancel</button>
          <button onClick={handleIngest} disabled={!newMasterName.trim()} style={{ backgroundColor: newMasterName.trim() ? 'rgb(36, 252, 176)' : '#f1f5f9', color: newMasterName.trim() ? 'rgb(20, 18, 59)' : '#94a3b8', padding: '12px 32px', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>Create Master</button>
        </div>
      </div>
    </div>
  );
};

export default CreateMasterModal;

