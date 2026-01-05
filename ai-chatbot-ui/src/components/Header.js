import React from 'react';
import { Menu, MessageSquare } from 'lucide-react';

const Header = ({ isSidebarOpen, setIsSidebarOpen, activeView, selectedMaster, setActiveView }) => {
  return (
    <header style={{ height: '72px', backgroundColor: 'rgb(20, 18, 59)', display: 'flex', alignItems: 'center', padding: '0 24px', color: '#fff', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      {!isSidebarOpen && (
        <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#fff', padding: '8px', borderRadius: '8px', marginRight: '20px', display: 'flex' }}>
          <Menu size={20} />
        </button>
      )}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{activeView === 'chat' ? selectedMaster : `Updating: ${selectedMaster}`}</span>
        <div style={{ padding: '4px 8px', backgroundColor: 'rgba(36, 252, 176, 0.2)', color: 'rgb(36, 252, 176)', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>Active</div>
      </div>
      {activeView === 'update' && (
        <button onClick={() => setActiveView('chat')} style={{ background: 'rgb(36, 252, 176)', border: 'none', color: 'rgb(20, 18, 59)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={18} /> Back to Chat
        </button>
      )}
    </header>
  );
};

export default Header;

