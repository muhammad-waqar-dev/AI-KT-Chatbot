import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import '../styles/ConfirmationModal.css';

const ConfirmationModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Yes, Delete', 
  cancelText = 'Cancel',
  type = 'danger' // 'danger' or 'warning'
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container confirmation-modal animate-in">
        <button className="modal-close-btn" onClick={onCancel}>
          <X size={20} />
        </button>
        
        <div className="modal-content">
          <div className={`icon-wrapper ${type}`}>
            <AlertTriangle size={24} />
          </div>
          
          <h3 className="modal-title">{title}</h3>
          <p className="modal-message">{message}</p>
          
          <div className="modal-actions">
            <button className="btn-secondary" onClick={onCancel}>
              {cancelText}
            </button>
            <button className={`btn-primary ${type}`} onClick={onConfirm}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

