import React from 'react';
import { User, Bot, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import '../styles/ChatView.css';

const ChatView = ({ messages, messagesEndRef, input, setInput, sendMessage, isLoading, selectedMaster }) => {
  return (
    <main className="chat-view-main">
      <div className="chat-messages-container">
        <div className="chat-messages-wrapper">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-item ${msg.role}`}>
              <div className={`message-header ${msg.role}`}>
                <div className={`avatar-wrapper ${msg.role}`}>
                  {msg.role === 'user' ? <User size={14} color="#64748b" /> : <Bot size={14} color="rgb(20, 18, 59)" />}
                </div>
                <span className="sender-name">
                  {msg.role === 'user' ? 'You' : 'AI Assistant'}
                </span>
              </div>
              <div className={`message-bubble ${msg.role} markdown-content`}>
                <ReactMarkdown>{msg.content || '...'}</ReactMarkdown>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="chat-input-section">
        <form onSubmit={sendMessage} className="chat-input-form">
          <input 
            type="text" 
            className="chat-input-field"
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder={`Message ${selectedMaster}...`} 
            disabled={isLoading} 
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()} 
            className={`chat-send-btn ${isLoading || !input.trim() ? '' : 'active'}`}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </main>
  );
};

export default ChatView;
