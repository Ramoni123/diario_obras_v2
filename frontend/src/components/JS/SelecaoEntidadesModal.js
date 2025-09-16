import React from 'react';
import './SelecaoEntidadesModal.css';

const SelecaoEntidadesModal = ({
  visivel,
  titulo,
  onFechar,
  children        
}) => {
  if (!visivel) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onFechar}>
      
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h2>{titulo}</h2>
          <button onClick={onFechar} className="btn-fechar-modal">&times;</button>
        </div>

        <div className="modal-body">
          {children}
        </div>


      </div>
    </div>
  );
};

export default SelecaoEntidadesModal;

