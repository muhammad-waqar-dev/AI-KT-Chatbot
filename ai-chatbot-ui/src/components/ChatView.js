import React from 'react';
import { User, Bot, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatView = ({ messages, messagesEndRef, input, setInput, sendMessage, isLoading, selectedMaster }) => {
  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'user' ? <User size={14} color="#64748b" /> : <Bot size={14} color="rgb(20, 18, 59)" />}
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{msg.role === 'user' ? 'You' : 'AI Assistant'}</span>
              </div>
              <div style={{ 
                padding: '16px 24px', borderRadius: '16px', 
                backgroundColor: msg.role === 'user' ? 'rgb(20, 18, 59)' : '#fff', 
                color: msg.role === 'user' ? '#fff' : '#1e293b', 
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
                lineHeight: '1.6', fontSize: '1rem'
              }}>
                <ReactMarkdown components={{ 
                  h1: ({node, ...props}) => <h1 style={{fontSize: '1.5rem', margin: '16px 0 8px 0', fontWeight: 800}} {...props} />,
                  h2: ({node, ...props}) => <h2 style={{fontSize: '1.25rem', margin: '14px 0 8px 0', fontWeight: 700}} {...props} />,
                  p: ({node, ...props}) => <p style={{margin: '0 0 12px 0'}} {...props} />,
                  code: ({node, ...props}) => <code style={{backgroundColor: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.9em', fontFamily: 'JetBrains Mono, monospace'}} {...props} />
                }}>{msg.content || '...'}</ReactMarkdown>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div style={{ padding: '32px', background: 'linear-gradient(to top, #f9fafb 80%, rgba(249, 250, 251, 0))' }}>
        <form onSubmit={sendMessage} style={{ 
          maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '12px', backgroundColor: '#fff', padding: '12px', 
          borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' 
        }}>
          <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder={`Message ${selectedMaster}...`} style={{ flex: 1, border: 'none', outline: 'none', padding: '8px 12px', fontSize: '1rem' }} disabled={isLoading} />
          <button type="submit" disabled={isLoading || !input.trim()} style={{ 
            padding: '12px', borderRadius: '12px', backgroundColor: isLoading || !input.trim() ? '#f1f5f9' : 'rgb(36, 252, 176)', 
            border: 'none', color: isLoading || !input.trim() ? '#94a3b8' : 'rgb(20, 18, 59)', cursor: 'pointer', transition: 'all 0.2s' 
          }}><Send size={20} /></button>
        </form>
      </div>
    </main>
  );
};

export default ChatView;

