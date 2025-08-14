import React, { useState, useEffect, use } from 'react';
import api from '../../services/api';
import '../../App.css';
import './VisualizarRelatorio.css';

// Mapa para traduzir a chave do clima (ex: 'chuva') para o texto de exibição (ex: 'Chuvoso')
const CLIMA_DISPLAY_MAP = {
  'sol': 'Ensolarado',
  'parcial': 'Parcialmente Nublado',
  'nublado': 'Nublado',
  'chuva': 'Chuvoso',
  'vento': 'Ventoso',
  'chuva_forte': 'Chuva Forte',
};

const formatarData = (dataString) => {
  if (!dataString) return 'Data não informada';
  const data = new Date(dataString + 'T00:00:00');
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return data.toLocaleDateString('pt-BR', options);
};

function VisualizarRelatorio({ relatorioId, onVoltarParaListaClick, onEditarClick }) {
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagemSelecionada, setImagemSelecionada] = useState(null)

  // Efeito para buscar os detalhes do relatório na API sempre que o ID mudar
  useEffect(() => {
    if (relatorioId) {
      const fetchRelatorio = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await api.get(`relatorios/${relatorioId}/`);
          setRelatorio(response.data);
        } catch (err) {
          console.error("Erro ao buscar detalhes do relatório:", err);
          setError("Falha ao carregar os detalhes do relatório. Tente novamente.");
        } finally {
          setLoading(false);
        }
      };
      fetchRelatorio();
    }
  }, [relatorioId]);

  const abrirFoto = (foto) => {
    setImagemSelecionada(foto)
  }

  const fecharFoto = (foto) => {
    setImagemSelecionada(null)
  }

  const handleClickOverlay = (e) => {
    if (e.target === e.currentTarget) {
      fecharFoto();
    }
  }
  // Renderizações condicionais para os estados de carregamento e erro
  if (loading) {
    return <div className="loading-message">Carregando detalhes do relatório...</div>;
  }
  if (error) {
    return <div className="error-message">Erro: {error} <button onClick={onVoltarParaListaClick}>Voltar</button></div>;
  }
  if (!relatorio) {
    return (
      <div className="visualizar-relatorio">
        <p>Relatório não encontrado.</p>
        <button onClick={onVoltarParaListaClick} className="btn-voltar-grande">Voltar para Lista</button>
      </div>
    );
  }

  // Renderização principal do componente com os dados do relatório
  return (
    <div className="visualizar-relatorio">
      <div className="header-visualizar-relatorio">
        {onVoltarParaListaClick && (
          <button type="button" onClick={onVoltarParaListaClick} className="btn-voltar-seta">←</button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
          <h1 className="form-title" style={{ margin: 0 }}>{`Relatório de ${formatarData(relatorio.Data)}`}</h1>
          {onEditarClick && (
            <button
              type="button"
              className="btn-editar"
              title="Editar relatório"
              onClick={() => onEditarClick(relatorio)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.5em',
                marginLeft: '8px',
                color: '#007bff',
                padding: 0,
              }}
            >
              ✏️
            </button>
          )}
        </div>
      </div>

      <div className="form-display-section">
        <div className="form-group-display">
          <strong className="form-label-display">Data:</strong>
          <p>{formatarData(relatorio.Data)}</p>
        </div>

        <div className="form-group-display">
          <strong className="form-label-display">Clima:</strong>
          <p>{CLIMA_DISPLAY_MAP[relatorio.Clima] || relatorio.Clima}</p>
        </div>

        <div className="form-group-display">
          <strong className="form-label-display">Descrição:</strong>
          <p className="descricao-texto">{relatorio.Descricao || "Nenhuma descrição fornecida."}</p>
        </div>

        <div className="form-group-display">
          <strong className="form-label-display">Trabalhadores:</strong>
          {relatorio.Trabalhadores_info && relatorio.Trabalhadores_info.length > 0 ? (
            <ul className="lista-info">
              {relatorio.Trabalhadores_info.map(trabalhador => (
                <li key={trabalhador.id}>{trabalhador.Nome} ({trabalhador.Funcao})</li>
              ))}
            </ul>
          ) : (
            <p>Nenhum trabalhador associado.</p>
          )}
        </div>

        <div className="form-group-display">
          <strong className="form-label-display">Equipamentos:</strong>
          {relatorio.Equipamentos_info && relatorio.Equipamentos_info.length > 0 ? (
            <ul className="lista-info">
              {relatorio.Equipamentos_info.map(equipamento => (
                <li key={equipamento.id}>{equipamento.Nome} ({equipamento.Tipo}) - Qtd: {equipamento.Quantidade_usada}</li>
              ))}
            </ul>
          ) : (
            <p>Nenhum equipamento associado.</p>
          )}
        </div>

        <div className="form-group-display">
          <strong className="form-label-display">Fotos:</strong>
          {relatorio.fotos && relatorio.fotos.length > 0 ? (
            <div className="fotos-visualizar-container">
              {relatorio.fotos.map(foto => (
                <div key={foto.id} className="foto-visualizar-item">
                  <img 
                    src={foto.Imagem.startsWith('http') ? foto.Imagem : `http://localhost:8000${foto.Imagem}`} 
                    alt={`Foto do relatório`} 
                    onClick={() => abrirFoto(foto)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p>Nenhuma foto adicionada.</p>
          )}
        </div>
      </div>
      {imagemSelecionada && (
        <div className="modal-overlay" onClick={handleClickOverlay}>
          <div className="modal-content">
            <button className="btn-fechar-modal" onClick={fecharFoto} title="Fechar">X</button>
            <img 
              src={imagemSelecionada.Imagem.startsWith('http') ? imagemSelecionada.Imagem : `http://localhost:8000${imagemSelecionada.Imagem}`} 
              alt="Imagem ampliada" 
              className="imagem-modal"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default VisualizarRelatorio;