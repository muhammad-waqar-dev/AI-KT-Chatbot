import React from 'react';
import { Menu, MessageSquare } from 'lucide-react';
import '../styles/Header.css';

const Header = ({ isSidebarOpen, setIsSidebarOpen, activeView, selectedMaster, setActiveView }) => {
  return (
    <header className="header-container">
      {!isSidebarOpen && (
        <button 
          className="open-sidebar-btn"
          onClick={() => setIsSidebarOpen(true)} 
        >
          <Menu size={20} />
        </button>
      )}
      <div className="header-title-wrapper">
        <span className="header-title">
          {activeView === 'chat' 
            ? selectedMaster 
            : activeView === 'documents' 
              ? `Knowledge Base: ${selectedMaster}`
              : `Updating: ${selectedMaster}`}
        </span>
        <div className="header-badge">Active</div>
      </div>
      {(activeView === 'update' || activeView === 'documents') && (
        <button 
          className="back-to-chat-btn"
          onClick={() => setActiveView('chat')} 
        >
          <MessageSquare size={18} /> Back to Chat
        </button>
      )}
    </header>
  );
};

export default Header;
