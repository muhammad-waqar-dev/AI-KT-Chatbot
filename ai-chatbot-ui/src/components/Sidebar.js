import React from 'react';
import { Layout, X, PlusCircle, FileText, MoreVertical, Edit3, Trash2 } from 'lucide-react';

const Sidebar = ({ 
  isSidebarOpen, 
  setIsSidebarOpen, 
  masters, 
  selectedMaster, 
  setSelectedMaster, 
  setActiveView, 
  handleMasterDelete, 
  openEditModal,
  openMenuId, 
  setOpenMenuId, 
  setIsModalOpen 
}) => {
  return (
    <aside style={{ 
      width: isSidebarOpen ? '300px' : '0', 
      backgroundColor: 'rgb(20, 18, 59)', 
      color: '#fff', 
      display: 'flex', 
      flexDirection: 'column', 
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
      overflow: 'hidden', 
      flexShrink: 0,
      boxShadow: isSidebarOpen ? '4px 0 10px rgba(0,0,0,0.1)' : 'none'
    }}>
      <div style={{ padding: '24px', width: '300px', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '0' }}>
            <Layout size={28} color="rgb(36, 252, 176)" style={{ flexShrink: 0 }} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>AI Assistant</h2>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              border: 'none', 
              cursor: 'pointer', 
              color: '#fff', 
              padding: '8px', 
              borderRadius: '8px', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <X size={18} />
          </button>
        </div>

        <button onClick={() => { setIsModalOpen(true); setActiveView('chat'); }} style={{ width: '100%', padding: '14px', borderRadius: '10px', backgroundColor: 'rgb(36, 252, 176)', color: 'rgb(20, 18, 59)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, marginBottom: '32px', boxShadow: '0 4px 12px rgba(36, 252, 176, 0.3)', transition: 'transform 0.2s', flexShrink: 0 }}>
          <PlusCircle size={20} /> New Master
        </button>

        <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '16px', fontWeight: 700, letterSpacing: '0.1em', flexShrink: 0 }}>Project Masters</p>
        
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {masters.map(master => {
            const m = master.masterName;
            const isActive = master.active;
            
            return (
            <div key={m} className="sidebar-item" style={{ 
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', 
              backgroundColor: selectedMaster === m ? 'rgba(255,255,255,0.1)' : 'transparent', 
                marginBottom: '8px', transition: 'background 0.2s', minWidth: 0,
                opacity: isActive ? 1 : 0.5
            }} onClick={() => { setSelectedMaster(m); setActiveView('chat'); }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: 0 }}>
                <FileText size={16} color={selectedMaster === m ? 'rgb(36, 252, 176)' : 'rgba(255,255,255,0.5)'} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span style={{ 
                  color: selectedMaster === m ? '#fff' : 'rgba(255,255,255,0.7)', 
                  fontSize: '0.95rem', 
                  fontWeight: selectedMaster === m ? 600 : 400,
                  wordBreak: 'break-word',
                  lineHeight: '1.4'
                }}>{m}</span>
              </div>
              <div style={{ position: 'relative', display: 'flex', flexShrink: 0, marginLeft: '8px' }}>
                <MoreVertical 
                  size={20} 
                  className="more-icon" 
                  style={{ 
                    opacity: (selectedMaster === m || openMenuId === m) ? 1 : 0.6, 
                    transition: 'all 0.2s', 
                    color: openMenuId === m ? 'rgb(36, 252, 176)' : 'rgba(255,255,255,0.7)', 
                    cursor: 'pointer', 
                    padding: '6px', 
                    margin: '-6px',
                    backgroundColor: openMenuId === m ? 'rgba(255,255,255,0.15)' : 'transparent',
                    borderRadius: '6px'
                  }} 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setOpenMenuId(openMenuId === m ? null : m); 
                  }} 
                />
                {openMenuId === m && (
                  <div style={{ 
                    position: 'absolute', 
                    right: '28px', 
                    top: '0', 
                    backgroundColor: '#fff', 
                    color: '#1f2937', 
                    borderRadius: '8px', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.4)', 
                    zIndex: 100000, 
                    width: '150px', 
                    padding: '8px', 
                    border: '1px solid #e5e7eb' 
                  }}>
                      <button onClick={(e) => { e.stopPropagation(); openEditModal(master); setOpenMenuId(null); }} style={{ width: '100%', padding: '12px', border: 'none', backgroundColor: 'transparent', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', borderRadius: '6px', color: '#1f2937' }} onMouseEnter={e => e.target.style.backgroundColor = '#f3f4f6'} onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}><Edit3 size={16} /> Edit Details</button>
                      <button onClick={(e) => { e.stopPropagation(); setActiveView('update'); setOpenMenuId(null); }} style={{ width: '100%', padding: '12px', border: 'none', backgroundColor: 'transparent', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', borderRadius: '6px', color: '#1f2937' }} onMouseEnter={e => e.target.style.backgroundColor = '#f3f4f6'} onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}><FileText size={16} /> Update Knowledge</button>
                    <button onClick={(e) => { e.stopPropagation(); handleMasterDelete(m); setOpenMenuId(null); }} style={{ width: '100%', padding: '12px', border: 'none', backgroundColor: 'transparent', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#ef4444', borderRadius: '6px' }} onMouseEnter={e => e.target.style.backgroundColor = '#fef2f2'} onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}><Trash2 size={16} /> Delete</button>
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

