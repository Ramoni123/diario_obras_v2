import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import './VisualizarRelatorio.css';
import '../../App.css'; 

const tiposClima = [
  { valor: 'sol', display: 'Ensolarado' },
  { valor: 'parcial', display: 'Parcialmente Nublado' },
  { valor: 'nublado', display: 'Nublado' },
  { valor: 'chuva', display: 'Chuvoso' },
  { valor: 'vento', display: 'Ventoso' },
  { valor: 'chuva_forte', display: 'Chuva Forte' }
];
const MAX_FOTOS = 6;

function FormularioRelatorio({ relatorioParaEditar, onSave, onVoltar, isSubmitting }) {
  const [Data, setData] = useState('');
  const [Clima, setClima] = useState('');
  const [Trabalhadores, setTrabalhadores] = useState([]);
  const [Equipamentos, setEquipamentos] = useState([]);
  const [Descricao, setDescricao] = useState('');
  
  const [fotosExistentes, setFotosExistentes] = useState([]);
  const [fotosRemovidasIds, setFotosRemovidasIds] = useState([]);
  const [fotosBlob, setFotosBlob] = useState([]);
  const [erroFotos, setErroFotos] = useState('');
  
  const [availableTrabalhadores, setAvailableTrabalhadores] = useState([]);
  const [availableEquipamentos, setAvailableEquipamentos] = useState([]);
  
  const [novoTrabalhador, setNovoTrabalhador] = useState({ Nome: '', Funcao: '' });
  const [mostrarFormTrabalhador, setMostrarFormTrabalhador] = useState(false);
  const [novoEquipamento, setNovoEquipamento] = useState({ Nome: '', Tipo: '' });
  const [mostrarFormEquipamento, setMostrarFormEquipamento] = useState(false);
  const [erroEquipamento, setErroEquipamento] = useState('');
  
  const [editingEquipId, setEditingEquipId] = useState(null);
  const [editingEquipData, setEditingEquipData] = useState({ Nome: '', Tipo: '' });
  
  const [quantidadesEquipamentos, setQuantidadesEquipamentos] = useState({});
  const MonteInicial = useRef(true);


  useEffect(() => {  //pega os dados pré existentes de trabalhadores, equipamentos etc
    api.get('trabalhadores/').then(res => setAvailableTrabalhadores(res.data));
    api.get('equipamentos/').then(res => setAvailableEquipamentos(res.data));
  }, []);
  
  useEffect(() => {
    if (relatorioParaEditar && MonteInicial.current) {
      MonteInicial.current = false;
      setData(relatorioParaEditar.Data || '');
      setClima(relatorioParaEditar.Clima_value || '');
      setDescricao(relatorioParaEditar.Descricao || '');

      const trabalhadoresIds = relatorioParaEditar.Trabalhadores_info ?
        relatorioParaEditar.Trabalhadores_info.map(t => t.id) : [];
      setTrabalhadores(trabalhadoresIds);

      if (relatorioParaEditar.Equipamentos_info) {
        const equipamentosIds = relatorioParaEditar.Equipamentos_info.map(eq => eq.id);
        setEquipamentos(equipamentosIds);

        const quantidades = {};
        relatorioParaEditar.Equipamentos_info.forEach(eq => {
          quantidades[eq.id] = eq.Quantidade_usada || 1;
        });
        setQuantidadesEquipamentos(quantidades);
      }

      setFotosExistentes(relatorioParaEditar.fotos || []);
    }
  }, [relatorioParaEditar]);

  useEffect(() => {
    return () => {
      fotosBlob.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
    };
  }, [fotosBlob]);
  
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!Data) {
      alert('Erro: Por favor, selecione a data do relatório.');
      return;
    }

    if (!Clima || Clima === '') {
      alert('Erro: Por favor, selecione as condições climáticas.');
      return;
    }

    if (Trabalhadores.length === 0) {
      alert('Erro: É necessário selecionar pelo menos um trabalhador.');
      return;
    }
    
    if (Equipamentos.length === 0) {
        alert('Erro: É necessário selecionar pelo menos um equipamento.');
        return;
    }

    if (!Descricao || Descricao.trim() === '') {
      alert('Erro: O campo "Descrição" é obrigatório e não pode estar em branco.');
      return;
    }

    const totalFotos = fotosExistentes.length + fotosBlob.length;
    if (totalFotos === 0) {
      alert('Erro: O relatório deve ter pelo menos uma foto.');
      return;
    }
    
    console.log("Todas as validações passaram. Preparando para salvar...");

    const equipamentos_com_quantidade = Equipamentos
      .map(equipId => ({
        Equipamento: parseInt(equipId, 10),
        Quantidade_usada: parseInt(quantidadesEquipamentos[equipId] || 1, 10)
      }))
      .filter(eq => !!eq.Equipamento);
    
    const relatorioData = { 
        Data, 
        Clima_input: Clima,
        Trabalhadores,
        equipamentos_com_quantidade,
        Descricao: Descricao.trim(),
    };
    
    onSave(relatorioData, fotosBlob, fotosRemovidasIds);
  };

  const handleTrabalhadoresChange = (e) => {
    const options = Array.from(e.target.selectedOptions, option => parseInt(option.value, 10));
    setTrabalhadores(options);
  };
  
  const handleEquipamentosChange = (equipamentoId) => {
    const idNum = parseInt(equipamentoId, 10);
    const isSelected = Equipamentos.includes(idNum);
    if (isSelected) {
      setEquipamentos(prev => prev.filter(id => id !== idNum));
      setQuantidadesEquipamentos(prev => {
        const newQuantidades = { ...prev };
        delete newQuantidades[idNum];
        return newQuantidades;
      });
    } else {
      setEquipamentos(prev => [...prev, idNum]);
      setQuantidadesEquipamentos(prev => ({
        ...prev,
        [idNum]: 1
      }));
    }
  };

  const handleQuantidadeChange = (equipamentoId, novaQuantidade) => {
    if (novaQuantidade === '') {
      setQuantidadesEquipamentos(prev => ({
        ...prev,
        [equipamentoId]: 1,
      }));
      return; // Para a execução aqui
    }
  
    const quantidadeNum = parseInt(novaQuantidade, 10);
    if (isNaN(quantidadeNum)) {
      return;
    }
  
    const quantidadeFinal = Math.max(1, quantidadeNum);
  
    setQuantidadesEquipamentos(prev => ({
      ...prev,
      [equipamentoId]: quantidadeFinal,
    }));
  };
  
  const handleFotoChange = (e) => {
    const novosArquivos = Array.from(e.target.files);
    setErroFotos('');
    if (fotosExistentes.length + fotosBlob.length + novosArquivos.length > MAX_FOTOS) {
      setErroFotos(`Máximo de ${MAX_FOTOS} fotos permitido.`);
      return;
    }
    const novasFotos = novosArquivos.map(file => ({ blob: file, previewUrl: URL.createObjectURL(file) }));
    setFotosBlob(prev => [...prev, ...novasFotos]);
  };

  const handleRemoverFotoExistente = (fotoId) => {
    setFotosExistentes(prev => prev.filter(foto => foto.id !== fotoId));
    setFotosRemovidasIds(prev => [...prev, fotoId]);
  };
  
  const handleRemoverNovaFoto = (index) => {
    setFotosBlob(prev => {
      const novaLista = [...prev];
      const [removida] = novaLista.splice(index, 1);
      URL.revokeObjectURL(removida.previewUrl);
      return novaLista;
    });
  };
  
    const adicionarTrabalhador = async () => {
        if (!novoTrabalhador.Nome || !novoTrabalhador.Funcao) {
          alert('Nome e Função do trabalhador são obrigatórios.');
          return;
        }
        try {
          const response = await api.post('trabalhadores/', novoTrabalhador);
          const trabalhadorCriado = response.data;
    
          const novoIdNumerico = parseInt(trabalhadorCriado.id, 10);
    
          if (isNaN(novoIdNumerico)) {
            console.error("API retornou um ID inválido para o novo trabalhador:", trabalhadorCriado);
            alert("Falha ao adicionar trabalhador: ID inválido recebido do servidor.");
            return;
          }
    
          const trabalhadorConsistente = { ...trabalhadorCriado, id: novoIdNumerico };
    
          setAvailableTrabalhadores(prev => [...prev, trabalhadorConsistente]);
          
          setTrabalhadores(prev => [...prev, novoIdNumerico]);
    
          setNovoTrabalhador({ Nome: '', Funcao: '' });
          setMostrarFormTrabalhador(false);
        } catch (error) {
          console.error("Erro ao adicionar trabalhador:", error);
          alert("Falha ao adicionar trabalhador.");
        }
      };

  const adicionarEquipamento = async () => {
    setErroEquipamento('');
    const nomeTrimmed = novoEquipamento.Nome.trim();
    if (!nomeTrimmed || !novoEquipamento.Tipo) {
      setErroEquipamento('Nome e Tipo são obrigatórios.');
      return;
    }
    const nomeExistente = availableEquipamentos.some(e => e.Nome.toLowerCase() === nomeTrimmed.toLowerCase());
    if (nomeExistente) {
      setErroEquipamento('Erro: Já existe um equipamento com este nome.');
      return;
    }
    try {
      const response = await api.post('equipamentos/', { Nome: nomeTrimmed, Tipo: novoEquipamento.Tipo });
      const equipamentoCriado = response.data;

      const novoIdNumerico = parseInt(equipamentoCriado.id, 10);
      if (isNaN(novoIdNumerico)) {
        console.error("ERRO CRÍTICO: A API retornou um ID inválido que resultou em NaN!", equipamentoCriado);
        alert("Falha ao adicionar equipamento: O servidor retornou um ID inválido.");
        return; // Aborta a função antes de atualizar o estado
      }

      const equipamentoConsistente = { ...equipamentoCriado, id: novoIdNumerico };
      setAvailableEquipamentos(prev => [...prev, equipamentoConsistente]);
      setEquipamentos(prev => [...prev, novoIdNumerico]);
      setQuantidadesEquipamentos(prev => ({
        ...prev,
        [novoIdNumerico]: 1
      }));
      setNovoEquipamento({ Nome: '', Tipo: '' });
      setMostrarFormEquipamento(false);
    } catch (error) {
      if (error.response?.data?.Nome) {
        setErroEquipamento(`Erro do servidor: ${error.response.data.Nome[0]}`);
      } else {
        setErroEquipamento("Ocorreu um erro ao salvar o equipamento.");
      }
    }
  };

  const handleIniciarEdicao = (equip) => {
    setEditingEquipId(equip.id);
    setEditingEquipData({ ...equip });
  };

  const handleCancelarEdicao = () => {
    setEditingEquipId(null);
  };

  const handleSalvarEdicao = async (id) => {
    try {
      const response = await api.put(`equipamentos/${id}/`, editingEquipData);
      setAvailableEquipamentos(prev => prev.map(e => (e.id === id ? response.data : e)));
      setEditingEquipId(null);
    } catch (error) {
      alert("Falha ao atualizar equipamento.");
    }
  };

  const handleDeletarEquipamento = async (id) => {
    if (window.confirm('Tem certeza que deseja apagar este equipamento permanentemente? Esta ação não pode ser desfeita.')) {
      try {
        await api.delete(`equipamentos/${id}/`);
        setAvailableEquipamentos(prev => prev.filter(e => e.id !== id));
        setEquipamentos(prev => prev.filter(equipId => equipId !== id));
        setQuantidadesEquipamentos(prev => {
          const newQuantidades = { ...prev };
          delete newQuantidades[id];
          return newQuantidades;
        });
      } catch (error) {
        alert("Falha ao deletar equipamento. Talvez ele esteja vinculado a algum relatório.");
      }
    }
  };
const getQuantidadeValue = (equipId) => {
  console.log(`Buscando quantidade para ID: [${equipId}] do tipo [${typeof equipId}]`);

  const qtd = quantidadesEquipamentos[equipId];
  
  if (typeof qtd === 'number' && !isNaN(qtd)) {
    return qtd;
  }
  
  return 1;
};

  const hoje = new Date().toISOString().slice(0,10);

  return (
    <div className="visualizar-relatorio">
      <div className="header-visualizar-relatorio">
        {onVoltar && (<button type="button" onClick={onVoltar} className="btn-voltar-seta">←</button>)}
        <h1 className="form-title">{relatorioParaEditar ? 'Editar Relatório' : 'Adicionar Relatório'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="form-display-section">
        
        <div className="form-group-display">
          <label htmlFor="data" className="form-label-display"><strong>Data:</strong></label>
          <input type="date" id="data" value={Data} onChange={(e) => setData(e.target.value)} className="form-control" required max={hoje} />
        </div>
        
        <div className="form-group-display">
          <label htmlFor="clima" className="form-label-display"><strong>Clima:</strong></label>
          <select id="clima" value={Clima} onChange={(e) => setClima(e.target.value)} className="form-control" required>
            <option value="">Selecione o clima</option>
            {tiposClima.map(tipo => <option key={tipo.valor} value={tipo.valor}>{tipo.display}</option>)}
          </select>
        </div>

        <div className="form-group-display">
          <label className="form-label-display">
            <strong>Trabalhadores:</strong>
            <button type="button" onClick={() => setMostrarFormTrabalhador(!mostrarFormTrabalhador)} className="btn-adicionar">
              {mostrarFormTrabalhador ? 'Cancelar' : '+ Novo'}
            </button>
          </label>
          {mostrarFormTrabalhador && (
            <div className="form-cadastro-rapido">
              <input type="text" placeholder="Nome do Trabalhador" value={novoTrabalhador.Nome} onChange={e => setNovoTrabalhador({...novoTrabalhador, Nome: e.target.value})} />
              <input type="text" placeholder="Função" value={novoTrabalhador.Funcao} onChange={e => setNovoTrabalhador({...novoTrabalhador, Funcao: e.target.value})} />
              <button type="button" onClick={adicionarTrabalhador} className="btn-salvar">Salvar</button>
            </div>
          )}
          <select multiple value={Trabalhadores} onChange={handleTrabalhadoresChange} className="form-control" style={{ height: '120px' }}>
            {availableTrabalhadores.map(worker => (
              <option key={worker.id} value={worker.id}>{worker.Nome} ({worker.Funcao})</option>
            ))}
          </select>
          <small>Use Ctrl/Cmd para selecionar múltiplos.</small>
        </div>

        <div className="form-group-display">
          <label className="form-label-display">
            <strong>Equipamentos:</strong>
            <button type="button" onClick={() => setMostrarFormEquipamento(!mostrarFormEquipamento)} className="btn-adicionar">
              {mostrarFormEquipamento ? 'Cancelar' : '+ Novo'}
            </button>
          </label>
          {mostrarFormEquipamento && (
             <div className="form-cadastro-rapido">
                <input type="text" placeholder="Nome do Equipamento" value={novoEquipamento.Nome} onChange={e => setNovoEquipamento({...novoEquipamento, Nome: e.target.value})} required />
                <input type="text" placeholder="Tipo (ex: Construção)" value={novoEquipamento.Tipo} onChange={e => setNovoEquipamento({...novoEquipamento, Tipo: e.target.value})} required />
                <button type="button" onClick={adicionarEquipamento} className="btn-salvar">Salvar</button>
             </div>
          )}
          {erroEquipamento && <div className="error-message" style={{ marginTop: '10px' }}>{erroEquipamento}</div>}
          <div className="checkbox-group">
            {availableEquipamentos.map(equip => (
              <div key={equip.id} className="list-item-container">
                {editingEquipId === equip.id ? (
                  <div className="form-edicao-em-linha">
                    <input type="text" value={editingEquipData.Nome} onChange={e => setEditingEquipData({...editingEquipData, Nome: e.target.value})} />
                    <input type="text" value={editingEquipData.Tipo} onChange={e => setEditingEquipData({...editingEquipData, Tipo: e.target.value})} />
                    <button type="button" onClick={() => handleSalvarEdicao(equip.id)} className="btn-salvar-edicao" title="Salvar">✔️</button>
                    <button type="button" onClick={handleCancelarEdicao} className="btn-cancelar-edicao" title="Cancelar">✖️</button>
                  </div>
                ) : (
                  <label className="checkbox-label-equipamento">
                    <div className="checkbox-info">
                      <input type="checkbox" value={equip.id} checked={Equipamentos.includes(equip.id)} onChange={() => handleEquipamentosChange(equip.id)} />
                      {equip.Nome} ({equip.Tipo})
                      {Equipamentos.includes(equip.id) && (
                        <div style={{ marginLeft: '20px', marginTop: '5px' }}>
                          <label>Qtd. usada: </label>
                          <input 
                            type="number" 
                            min="1" 
                            value={getQuantidadeValue(equip.id)} 
                            onChange={e => handleQuantidadeChange(equip.id, e.target.value)}
                            className="quantidade-input"
                            style={{ width: '60px', marginLeft: '5px' }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="acoes-equipamento">
                      <button type="button" onClick={() => handleIniciarEdicao(equip)} className="btn-acao-equip" title="Editar">✏️</button>
                      <button type="button" onClick={() => handleDeletarEquipamento(equip.id)} className="btn-acao-equip" title="Deletar">🗑️</button>
                    </div>
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-group-display">
          <label htmlFor="descricao" className="form-label-display"><strong>Descrição:</strong></label>
          <textarea id="descricao" value={Descricao} onChange={e => setDescricao(e.target.value)} className="form-control" rows={5} />
        </div>

        <div className="form-group-display">
          <strong className="form-label-display">Fotos</strong>
          {relatorioParaEditar && fotosExistentes.length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <p style={{ marginBottom: '5px', fontSize: '0.9em', color: '#555' }}>Fotos existentes (clique no X para remover):</p>
              <div className="fotos-preview-container">
                {fotosExistentes.map(foto => (
                  <div key={foto.id} className="foto-preview-item">
                    <img src={foto.Imagem.startsWith('http') ? foto.Imagem : `http://localhost:8000${foto.Imagem}`} alt={foto.Descricao} />
                    <button type="button" onClick={() => handleRemoverFotoExistente(foto.id)} className="remover-foto-btn" title="Marcar para remover">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <label htmlFor="fotos" className="form-label-display" style={{ fontSize: '0.9em', display: 'block', marginTop: '10px' }}>Adicionar Novas Fotos(Min. 1 foto):</label>
          <input type="file" id="fotos" multiple accept="image/*" onChange={handleFotoChange} className="form-control" />
          {erroFotos && <div className="error-message">{erroFotos}</div>}
          {fotosBlob.length > 0 &&
            <div className="fotos-preview-container" style={{ marginTop: '10px' }}>
              {fotosBlob.map((foto, index) => (
                <div key={index} className="foto-preview-item">
                  <img src={foto.previewUrl} alt={`Preview ${index}`} />
                  <button type="button" onClick={() => handleRemoverNovaFoto(index)} className="remover-foto-btn">×</button>
                </div>
              ))}
            </div>
          }
        </div>
        
        <div className="form-group-display">
          <button type="submit" className="submit-button" disabled={isSubmitting} style={{ width: '100%', padding: '15px', marginTop: '20px' }}>
            {relatorioParaEditar ? 'Salvar Alterações' : 'Criar Relatório'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormularioRelatorio;