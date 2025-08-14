import React from 'react';

function Header() {
    return (
      <header className="main-header">
        <div className="header-content">
          {/* Placeholder da imagem */}
          <div className="logo-placeholder">
            <h4>*Logo*</h4>
          </div>
          
          {/* Links de navegação */}
          <nav className="nav-links">
            <a href="#inicio" className="nav-link">Início</a>
            <a href="#contatos" className="nav-link">Contatos</a>
            <button className="nav-link logout">Sair</button>
          </nav>
        </div>
      </header>
    );
  }
  
  export default Header;