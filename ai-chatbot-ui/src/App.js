import React, { useState, useRef, useEffect } from 'react';
import { api } from './services/api';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatView from './components/ChatView';
import TrainingView from './components/TrainingView';
import DocumentsView from './components/DocumentsView';
import CreateMasterModal from './components/CreateMasterModal';
import ConfirmationModal from './components/ConfirmationModal';
import './styles/App.css';

function App() {
  const [masters, setMasters] = useState([]);
  const [selectedMaster, setSelectedMaster] = useState('');
  const [selectedMasterId, setSelectedMasterId] = useState(null);
  const [activeView, setActiveView] = useState('chat');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI KT Assistant. Select a Master and ask me anything about it.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    onConfirm: () => {},
    masterToDelete: null 
  });
  
  const [newMasterName, setNewMasterName] = useState('');
  const [newMasterIconUrl, setNewMasterIconUrl] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMasterName, setEditMasterName] = useState('');
  const [editMasterStatus, setEditMasterStatus] = useState(true);

  const [ingestText, setIngestText] = useState('');
  const [ingestFile, setIngestFile] = useState(null);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestStatus, setIngestStatus] = useState(null);

  const messagesEndRef = useRef(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      fetchMasters();
      hasFetched.current = true;
    }
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMasters = async () => {
    try {
      const res = await api.getMasters();
      setMasters(res.data);
      if (res.data.length > 0) {
        if (!selectedMaster) {
          // Filter active ones for selection
          const active = res.data.filter(m => m.active);
          if (active.length > 0) {
            setSelectedMaster(active[0].masterName);
            setSelectedMasterId(active[0].id);
          }
        } else {
          // Ensure the ID is synced with the name
          const current = res.data.find(m => m.masterName === selectedMaster);
          if (current) setSelectedMasterId(current.id);
        }
      }
    } catch (e) { console.error("Failed to fetch masters", e); }
  };

  const handleMasterDelete = (name) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Master',
      message: `Are you sure you want to delete "${name}"? This will remove all associated knowledge and settings.`,
      masterToDelete: name,
      onConfirm: async () => {
        try {
          await api.deleteMaster(name);
          fetchMasters();
          if (selectedMaster === name) {
            const other = masters.find(m => m.masterName !== name);
            setSelectedMaster(other ? other.masterName : '');
            setSelectedMasterId(other ? other.id : null);
            setActiveView('chat');
          }
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (e) { 
          console.error("Delete failed", e);
          alert("Failed to delete master.");
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    setMessages(prev => [...prev, { role: 'user', content: input }, { role: 'assistant', content: '' }]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    api.getChatStream(
      currentInput,
      selectedMaster,
      (token) => {
        setMessages(prev => {
          const newMessages = [...prev];
          const last = newMessages.length - 1;
          newMessages[last] = { ...newMessages[last], content: newMessages[last].content + token };
          return newMessages;
        });
      },
      () => setIsLoading(false),
      (error) => {
        console.error(error);
        setMessages(prev => {
          const newMessages = [...prev];
          const last = newMessages.length - 1;
          newMessages[last] = { role: 'assistant', content: 'Sorry, I encountered an error. Please check if the backend and Ollama are running.' };
          return newMessages;
        });
        setIsLoading(false);
      }
    );
  };

  const handleCreateMaster = async (e) => {
    if (e) e.preventDefault();
    if (!newMasterName.trim()) return;

    setIsIngesting(true);
    try {
      if (isEditMode) {
        await api.updateMaster(editingMasterName, { 
          name: newMasterName, 
          isActive: editMasterStatus,
          iconUrl: newMasterIconUrl
        });
        setIngestStatus({ type: 'success', message: 'Master updated!' });
        if (selectedMaster === editingMasterName) setSelectedMaster(newMasterName);
      } else {
        await api.createMaster(newMasterName, newMasterIconUrl);
        setIngestStatus({ type: 'success', message: 'Master created!' });
      }
      fetchMasters();
      if (!isEditMode) {
        setSelectedMaster(newMasterName);
        // We don't have the ID yet until fetchMasters finishes, 
        // but fetchMasters will update it if selectedMaster is set.
        // Actually, it only sets it if !selectedMaster.
      }
      setTimeout(() => {
        setIsModalOpen(false);
        setNewMasterName('');
        setNewMasterIconUrl('');
        setIsEditMode(false);
        setEditMasterName('');
        setIngestStatus(null);
      }, 1500);
    } catch (err) {
      setIngestStatus({ type: 'error', message: err.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} master` });
    } finally {
      setIsIngesting(false);
    }
  };

  const openEditModal = (master) => {
    setNewMasterName(master.masterName);
    setNewMasterIconUrl(master.iconUrl || '');
    setEditMasterName(master.masterName);
    setEditMasterStatus(master.active);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleIngest = async (e) => {
    if (e) e.preventDefault();
    if (!selectedMaster) return;
    
    setIsIngesting(true);
    const formData = new FormData();
    formData.append('masterName', selectedMaster);
    if (ingestFile) formData.append('file', ingestFile);
    if (ingestText) formData.append('text', ingestText);
    
    try {
      await api.ingest(formData);
      setIngestStatus({ type: 'success', message: 'Knowledge indexed!' });
      setIngestText(''); 
      setIngestFile(null); 
      setTimeout(() => setIngestStatus(null), 3000);
    } catch (err) {
      setIngestStatus({ type: 'error', message: err.response?.data?.error || 'Failed' });
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', backgroundColor: '#fff', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        masters={masters}
        selectedMaster={selectedMaster}
        setSelectedMaster={setSelectedMaster}
        selectedMasterId={selectedMasterId}
        setSelectedMasterId={setSelectedMasterId}
        setActiveView={setActiveView}
        handleMasterDelete={handleMasterDelete}
        openEditModal={openEditModal}
        openMenuId={openMenuId}
        setOpenMenuId={setOpenMenuId}
        setIsModalOpen={(isOpen) => {
          setIsModalOpen(isOpen);
          if (!isOpen) {
            setIsEditMode(false);
            setNewMasterName('');
            setNewMasterIconUrl('');
          }
        }}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#f9fafb' }}>
        <Header 
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          activeView={activeView}
          selectedMaster={selectedMaster}
          setActiveView={setActiveView}
        />

        {activeView === 'chat' ? (
          <ChatView 
            messages={messages}
            messagesEndRef={messagesEndRef}
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
            isLoading={isLoading}
            selectedMaster={selectedMaster}
          />
        ) : activeView === 'documents' ? (
          <DocumentsView 
            selectedMaster={selectedMaster}
            selectedMasterId={selectedMasterId}
            setActiveView={setActiveView}
            activeView={activeView}
          />
        ) : (
          <TrainingView 
            selectedMaster={selectedMaster}
            handleIngest={handleIngest}
            ingestText={ingestText}
            setIngestText={setIngestText}
            ingestFile={ingestFile}
            setIngestFile={setIngestFile}
            isIngesting={isIngesting}
            ingestStatus={ingestStatus}
            setActiveView={setActiveView}
          />
        )}
      </div>

      <CreateMasterModal 
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        newMasterName={newMasterName}
        setNewMasterName={setNewMasterName}
        newMasterIconUrl={newMasterIconUrl}
        setNewMasterIconUrl={setNewMasterIconUrl}
        handleCreateMaster={handleCreateMaster}
        isIngesting={isIngesting}
        ingestStatus={ingestStatus}
        isEditMode={isEditMode}
        editMasterStatus={editMasterStatus}
        setEditMasterStatus={setEditMasterStatus}
      />

      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default App;
