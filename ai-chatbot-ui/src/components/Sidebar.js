import React, { useState } from 'react';
import { Layout, X, PlusCircle, FileText, MoreVertical, Edit3, Trash2, ChevronDown, ChevronRight, Settings, Users, Database } from 'lucide-react';
import '../styles/Sidebar.css';

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
  const [isMastersOpen, setIsMastersOpen] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  return (
    <aside className={`sidebar-aside ${isSidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-content">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Layout size={28} color="rgb(36, 252, 176)" />
            <h2>AI Assistant</h2>
          </div>
          <button 
            className="close-sidebar-btn"
            onClick={() => setIsSidebarOpen(false)} 
          >
            <X size={18} />
          </button>
        </div>

        <button 
          className="new-master-btn"
          onClick={() => { setIsModalOpen(true); setActiveView('chat'); }}
        >
          <PlusCircle size={20} /> New Master
        </button>

        <div className="sidebar-accordion">
          <div 
            className="sidebar-accordion-header" 
            onClick={() => setIsMastersOpen(!isMastersOpen)}
          >
            <span className="sidebar-section-label">Project Masters</span>
            {isMastersOpen ? <ChevronDown size={14} className="accordion-icon" /> : <ChevronRight size={14} className="accordion-icon" />}
          </div>
          
          <div className={`masters-list ${isMastersOpen ? 'expanded' : 'collapsed'}`}>
            {masters.map(master => {
              const m = master.masterName;
              const isActive = master.active;
              
              return (
              <div 
                key={m} 
                className={`sidebar-item ${selectedMaster === m ? 'selected' : ''} ${!isActive ? 'inactive' : ''}`}
                onClick={() => { setSelectedMaster(m); setActiveView('chat'); }}
              >
                <div className="master-info">
                  {master.iconUrl ? (
                    <img 
                      src={master.iconUrl} 
                      alt="" 
                      className="master-icon-img" 
                    />
                  ) : (
                    <FileText 
                      size={16} 
                      color={selectedMaster === m ? 'rgb(36, 252, 176)' : 'rgba(255,255,255,0.5)'} 
                      style={{ marginTop: '2px', flexShrink: 0 }} 
                    />
                  )}
                  <span className="master-name">{m}</span>
                </div>
                <div className="menu-trigger-wrapper">
                  <MoreVertical 
                    size={20} 
                    className={`more-icon ${openMenuId === m ? 'open' : ''}`} 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setOpenMenuId(openMenuId === m ? null : m); 
                    }} 
                  />
                  {openMenuId === m && (
                    <div className="dropdown-menu">
                      <button 
                        className="dropdown-item"
                        onClick={(e) => { e.stopPropagation(); openEditModal(master); setOpenMenuId(null); }}
                      >
                        <Edit3 size={16} /> Edit Details
                      </button>
                      <button 
                        className="dropdown-item"
                        onClick={(e) => { e.stopPropagation(); setActiveView('update'); setOpenMenuId(null); }}
                      >
                        <FileText size={16} /> Update Knowledge
                      </button>
                      <button 
                        className="dropdown-item delete"
                        onClick={(e) => { e.stopPropagation(); handleMasterDelete(m); setOpenMenuId(null); }}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        </div>

        <div className="sidebar-accordion" style={{ marginTop: '16px' }}>
          <div 
            className="sidebar-accordion-header" 
            onClick={() => setIsAdminOpen(!isAdminOpen)}
          >
            <span className="sidebar-section-label">Administrations</span>
            {isAdminOpen ? <ChevronDown size={14} className="accordion-icon" /> : <ChevronRight size={14} className="accordion-icon" />}
          </div>
          
          <div className={`admin-list ${isAdminOpen ? 'expanded' : 'collapsed'}`}>
            <div className="sidebar-item" onClick={() => setActiveView('users')}>
              <div className="master-info">
                <Users size={16} color="rgba(255,255,255,0.5)" />
                <span className="master-name">User Management</span>
              </div>
            </div>
            <div className="sidebar-item" onClick={() => setActiveView('settings')}>
              <div className="master-info">
                <Settings size={16} color="rgba(255,255,255,0.5)" />
                <span className="master-name">System Settings</span>
              </div>
            </div>
            <div className="sidebar-item" onClick={() => setActiveView('database')}>
              <div className="master-info">
                <Users size={16} color="rgba(255,255,255,0.5)" />
                <span className="master-name">Database Logs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
