import React, { use } from 'react';
import './ListaObras.css';
import { useAuth } from '../../contexts/AuthContext';

// Adicionei Font Awesome para os ícones. Certifique-se de ter o link no seu index.html
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />

const ListaObras = ({ obras, 
    loading, 
    onSelecionarObra, 
    onAdicionarObra, 
    onVisualizarObra, 
    onExcluirObra, 
    onEditarObra, 
    onGerenciarUsuarios }) => {
    const { hasRole } = useAuth()
    if (loading) {
        return <p className="loading-obras">Carregando obras...</p>;
    }

    const handleVerDetalhesClick = (e, obraId) => {
        e.stopPropagation();
        onVisualizarObra(obraId);
    }

    const handleExcluirClick = (e, obraId) => {
        e.stopPropagation();
        onExcluirObra(obraId);
    };

    const handleEditarClick = (e, obra) => {
        e.stopPropagation();
        onEditarObra(obra);
    };

return (
    <div className="lista-obras-container">
        <div className="lista-obras-header">
            <h1>Obras</h1>
            
            {hasRole(['Administradores']) && (
                <div className="lista-obras-actions">
                    <button onClick={onGerenciarUsuarios} className="btn-gerenciar-usuarios">
                        Gerenciar Usuários
                    </button>
                    <button onClick={onAdicionarObra} className="btn-adicionar-obra">
                        Adicionar Obra
                    </button>
                </div>
            )}
        </div>

        <ul className="obras-list">
            {obras.map(obra => (
                <li
                    key={obra.id}
                    onClick={() => onSelecionarObra(obra.id)}
                    className="obra-item"
                >
                    <div className="obra-item-top-actions">
                        {hasRole(['Administradores']) && (
                            <>
                                <button onClick={(e) => handleEditarClick(e, obra)} className='btn-action-icon btn-editar-obra' title="Editar Obra">
                                    <i className="fas fa-pencil-alt"></i>
                                </button>
                                <button onClick={(e) => handleExcluirClick(e, obra.id)} className='btn-action-icon btn-excluir-obra' title="Excluir Obra">
                                    <i className="fas fa-trash-alt"></i>
                                </button>
                            </>
                        )}
                    </div>

                    <h3>{obra.Nome}</h3>
                    <p>Status: {obra.status_legivel}</p>
                    <p>Total de Relatórios: {obra.quantidade_relatorios}</p>
                    
                    <div className="obra-item-bottom-actions">
                        <button
                            onClick={(e) => handleVerDetalhesClick(e, obra.id)}
                            className="btn-ver-detalhes"
                        >
                            Ver Detalhes
                        </button>
                    </div>
                </li>
            ))}
        </ul>
        </div>
    );
};

export default ListaObras;
