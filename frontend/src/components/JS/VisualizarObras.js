import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './VisualizarObras.css'; 

const formatarData = (data) => {
    if (!data) return 'Não definida';
    const dataObj = new Date(data);
    dataObj.setDate(dataObj.getDate() + 1);
    return new Intl.DateTimeFormat('pt-BR').format(dataObj);
};

const VisualizarObra = ({ obraId, onVoltar }) => {
    const [obra, setObra] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        console.log('ID recebido pelo componente para buscar a obra:', obraId);
        const fetchVisualizarObra = async () => {
            if (!obraId) return;

            setLoading(true);
            setError('');
            try {
                const response = await api.get(`/obras/${obraId}/`);
                console.log('dados da api', response.api)
                setObra(response.data);
            } catch (err) {
                setError('Não foi possível carregar os detalhes da obra.');
                console.error("Erro ao buscar detalhes da obra:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchVisualizarObra();
    }, [obraId]);

    if (loading) {
        return <p className="loading-detalhes">Carregando detalhes...</p>;
    }

    if (error) {
        return <p className="error-detalhes">{error}</p>;
    }

    if (!obra) {
        return null; 
    }

    return (
        <div className="visualizar-obra">
            <div className="header-visualizar-obra">
                <h2 className="obra-title">{obra.Nome}</h2>
                <span className={`status-tag status-${obra.Status}`}>{obra.status_legivel}</span>
            </div>
            <div className="obra-display-section">
                <div className="obra-group-display">
                    <span className="obra-label-display">Endereço:</span>
                    <p>{obra.Endereco}</p>
                </div>
                <div className="obra-group-display">
                    <span className="obra-label-display">Descrição:</span>
                    <p className="descricao-texto">{obra.Descricao || 'Nenhuma descrição fornecida.'}</p>
                </div>
                <div className='obra-group-display'>
                    <span className='obra-label-display'>Quantidade de relatórios:</span>
                    <p>{obra.quantidade_relatorios}</p>
                </div>                
                <div className="obra-group-display">
                    <span className="obra-label-display">Data de Início:</span>
                    <p>{formatarData(obra.Data_inicio)}</p>
                </div>
                <div className="obra-group-display">
                    <span className="obra-label-display">Data de Fim Prevista:</span>
                    <p>{formatarData(obra.Data_fim)}</p>
                </div>
                <div className='obra-group-display'>
                    <span className='obra-label-display'>Status:</span>
                    <p>{obra.status_legivel}</p>
                </div>
            </div>
        </div>
    );
};

export default VisualizarObra;
