import React, { useState, useRef, useEffect } from 'react';
import { api } from './services/api';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatView from './components/ChatView';
import TrainingView from './components/TrainingView';
import CreateMasterModal from './components/CreateMasterModal';
import './styles/App.css';

function App() {
  const [masters, setMasters] = useState([]);
  const [selectedMaster, setSelectedMaster] = useState('');
  const [activeView, setActiveView] = useState('chat');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI KT Assistant. Select a Master and ask me anything about it.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  
  const [newMasterName, setNewMasterName] = useState('');
  const [ingestText, setIngestText] = useState('');
  const [ingestFile, setIngestFile] = useState(null);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestStatus, setIngestStatus] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMasters();
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
      if (res.data.length > 0 && !selectedMaster) {
        setSelectedMaster(res.data[0]);
      }
    } catch (e) { console.error("Failed to fetch masters", e); }
  };

  const handleMasterDelete = async (name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await api.deleteMaster(name);
      fetchMasters();
      if (selectedMaster === name) {
        const other = masters.find(m => m !== name);
        setSelectedMaster(other || '');
        setActiveView('chat');
      }
    } catch (e) { console.error("Delete failed", e); }
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

  const handleIngest = async (e) => {
    if (e) e.preventDefault();
    const masterToUse = activeView === 'update' ? selectedMaster : newMasterName;
    if (!masterToUse.trim()) return;
    
    setIsIngesting(true);
    const formData = new FormData();
    formData.append('masterName', masterToUse);
    if (ingestFile) formData.append('file', ingestFile);
    if (ingestText) formData.append('text', ingestText);
    
    try {
      await api.ingest(formData);
      setIngestStatus({ type: 'success', message: 'Knowledge indexed!' });
      fetchMasters();
      if (activeView !== 'update') {
        setTimeout(() => { 
          setIsModalOpen(false); 
          setNewMasterName(''); 
          setIngestText(''); 
          setIngestFile(null); 
          setIngestStatus(null); 
        }, 1500);
      } else {
        setIngestText(''); 
        setIngestFile(null); 
        setTimeout(() => setIngestStatus(null), 3000);
      }
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
        setActiveView={setActiveView}
        handleMasterDelete={handleMasterDelete}
        openMenuId={openMenuId}
        setOpenMenuId={setOpenMenuId}
        setIsModalOpen={setIsModalOpen}
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
        handleIngest={handleIngest}
      />
    </div>
  );
}

export default App;
