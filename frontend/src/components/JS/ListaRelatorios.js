import React from 'react';
import './ListaRelatorios.css';
import api from '../../services/api';
import FiltroMes from './FiltroMes';

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

const ListaRelatorios = ({ 
  relatorios, 
  loading, 
  error, 
  onAdicionarClick, 
  onVerDetalhes, 
  onEditarClick, 
  onDeleteSuccess, 
  onVoltarParaObras,
  mesSelecionado,
  onChangeMes 
}) => {
  
  const handleDeletarRelatorio = async (relatorioId) => {
    try {
      await api.delete(`relatorios/${relatorioId}/`);
      alert('Relatório excluído com sucesso!');
      if (onDeleteSuccess && typeof onDeleteSuccess === 'function') {
        onDeleteSuccess();
      }
    } catch (err) {
      alert("Erro ao excluir relatório.");
    }
  };
  
  const confirmarExclusao = (relatorioId, e) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este relatório?')) {
      handleDeletarRelatorio(relatorioId);
    }
  };

  return (
    <div className="lista-relatorios-container">
      <div className="header-lista-relatorios">
        {onVoltarParaObras && (
          <button 
            type="button" 
            onClick={onVoltarParaObras} 
            className="btn-voltar-seta"
            title="Voltar para lista de obras"
          >
            ←
          </button>
        )}
        <h1 className="titulo-pagina">Relatórios</h1>
      </div>
      
      <div className='controles-lista'>
        <FiltroMes 
          mesSelecionado={mesSelecionado || ''} 
          onChangeMes={onChangeMes} 
        />
      </div>

      <div className="adicionar-relatorio-container">
        <button className="btn-adicionar-relatorio" onClick={onAdicionarClick}>
          Adicionar Relatório
        </button>
      </div>

      {loading && <div className="mensagem-status">Carregando...</div>}
      {error && <div className="mensagem-erro">{error}</div>}
      {!loading && !error && relatorios.length === 0 && (
        <div className="mensagem-status">
          Nenhum relatório encontrado para esse mês
        </div>
      )}

      <div className="relatorios-grid">
        {relatorios && relatorios.map(relatorio => (
          <div key={relatorio.id} className="relatorio-card">
            <div className="relatorio-cabecalho">
              <h3>{formatarData(relatorio.Data)}</h3>

              <span className={`clima-badge clima-${String(relatorio.Clima || '').toLowerCase()}`}>
                {CLIMA_DISPLAY_MAP[relatorio.Clima] || relatorio.Clima}
              </span>

            </div>
            <div className="relatorio-corpo">
              <p className="relatorio-descricao">
                {(relatorio.Descricao || "Sem descrição.").substring(0, 150)}
                {(relatorio.Descricao && relatorio.Descricao.length > 150) ? '...' : ''}
              </p>
              <div className="relatorio-detalhes">
                <div className="detalhe-item">
                  <span>Trabalhadores:</span>
                  <span>{relatorio.Trabalhadores_info ? relatorio.Trabalhadores_info.length : 0}</span>
                </div>
                <div className="detalhe-item">
                  <span>Equipamentos:</span>
                  <span>{relatorio.Equipamentos_info ? relatorio.Equipamentos_info.length : 0}</span>
                </div>
              </div>
            </div>
            <div className="relatorio-rodape">
              <div className="acoes-esquerda">
                <button 
                  className="btn-editar" 
                  title="Editar relatório" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (onEditarClick) onEditarClick(relatorio); 
                  }}
                >
                  ✏️
                </button>
                <button 
                  className="btn-excluir" 
                  title="Inativar relatório" 
                  onClick={(e) => confirmarExclusao(relatorio.id, e)}
                >
                  ❌
                </button>
              </div>
              <button 
                className="btn-detalhes" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (onVerDetalhes) onVerDetalhes(relatorio.id); 
                }}
              >
                Ver Detalhes
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListaRelatorios;