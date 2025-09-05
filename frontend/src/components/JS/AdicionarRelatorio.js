import React, { useState, useEffect } from 'react';
import '../../App.css';


function AdicionarRelatorio({ onVoltarParaListaClick }) {
  const [Data, setData] = useState('');
  const [Clima, setClima] = useState('');
  const [Trabalhadores, setTrabalhadores] = useState([]);
  const [Equipamentos, setEquipamentos] = useState([]);
  const [Descricao, setDescricao] = useState('');
  const [fotosBlob, setFotosBlob] = useState([]); 
  const [erroFotos, setErroFotos] = useState('');

  const [availableTrabalhadores, setAvailableTrabalhadores] = useState([]);
  const [availableEquipamentos, setAvailableEquipamentos] = useState([]);

  const [novoTrabalhador, setNovoTrabalhador] = useState({ nome: '', funcao: '' });
  const [novoEquipamento, setNovoEquipamento] = useState({ nome: '', tipo: '' });
  const [mostrarFormTrabalhador, setMostrarFormTrabalhador] = useState(false);
  const [mostrarFormEquipamento, setMostrarFormEquipamento] = useState(false);

  const tiposClima = ['Ensolarado', 'Parcialmente Nublado', 'Nublado', 'Chuvoso', 'Ventoso', 'Chuva Forte'];
  const MAX_FOTOS = 6;
  const MIN_FOTOS = 1;

  useEffect(() => {
    fetch('http://localhost:8000/api/trabalhadores/')
      .then(response => response.json())
      .then(data => setAvailableTrabalhadores(data))
      .catch(error => console.error("Erro ao buscar trabalhadores:", error));

    fetch('http://localhost:8000/api/equipamentos/')
      .then(response => response.json())
      .then(data => setAvailableEquipamentos(data))
      .catch(error => console.error("Erro ao buscar equipamentos:", error));
  }, []);

  const adicionarTrabalhador = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/trabalhadores/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoTrabalhador),
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableTrabalhadores([...availableTrabalhadores, data]);
        setTrabalhadores([...Trabalhadores, data.id]);
        setNovoTrabalhador({ nome: '', funcao: '' });
        setMostrarFormTrabalhador(false);
      } else {
        console.error("Falha ao adicionar trabalhador:", await response.text());
      }
    } catch (error) {
      console.error("Erro ao adicionar trabalhador:", error);
    }
  };

  const adicionarEquipamento = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/equipamentos/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: novoEquipamento.nome, tipo: novoEquipamento.tipo }),
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableEquipamentos([...availableEquipamentos, data]);
        setEquipamentos([...Equipamentos, data.id]);
        setNovoEquipamento({ nome: '', tipo: '' });
        setMostrarFormEquipamento(false);
      } else {
        console.error("Falha ao adicionar equipamento:", await response.text());
      }
    } catch (error) {
      console.error("Erro ao adicionar equipamento:", error);
    }
  };
  
  const handleTrabalhadoresChange = (e) => {
    const options = Array.from(e.target.selectedOptions);
    setTrabalhadores(options.map(option => parseInt(option.value, 10)));
  };

  const handleEquipamentosChange = (equipamentoId) => {
    const idNumerico = parseInt(equipamentoId, 10);
    setEquipamentos(prevEquipIds =>
      prevEquipIds.includes(idNumerico)
        ? prevEquipIds.filter(id => id !== idNumerico)
        : [...prevEquipIds, idNumerico]
    );
  };

  const handleFotoChange = (e) => {
    const files = Array.from(e.target.files);
    const totalFotos = fotosBlob.length + files.length;

    if (totalFotos > MAX_FOTOS) {
      setErroFotos(`Máximo de ${MAX_FOTOS} fotos permitido.`);
      return;
    }

    const novasFotos = files.map(file => ({
      blob: file,
      previewUrl: URL.createObjectURL(file)
    }));

    setFotosBlob([...fotosBlob, ...novasFotos]);
    setErroFotos('');
  };

  const handleRemoverFoto = (index) => {
    const novasFotos = [...fotosBlob];
    URL.revokeObjectURL(novasFotos[index].previewUrl);
    novasFotos.splice(index, 1);
    setFotosBlob(novasFotos);
    
    if (novasFotos.length < MIN_FOTOS) {
      setErroFotos(`Mínimo de ${MIN_FOTOS} foto(s) requerida.`);
    } else {
      setErroFotos('');
    }
  };

  useEffect(() => {
    return () => {
      fotosBlob.forEach(({ previewUrl }) => {
        URL.revokeObjectURL(previewUrl);
      });
    };
  }, [fotosBlob]);

  const controllerRelatorio = async (e) => {
    e.preventDefault();

    if (fotosBlob.length < MIN_FOTOS) {
      setErroFotos(`Mínimo de ${MIN_FOTOS} foto(s) requerida.`);
      return;
    }

    const relatorioData = {
      Data,
      Clima,
      Trabalhadores,
      Equipamentos,
      Descricao,
    };

    try {
      const relatorioResponse = await fetch('http://localhost:8000/api/relatorios/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(relatorioData),
      });

      if (!relatorioResponse.ok) {
        const errorData = await relatorioResponse.json();
        alert(`Erro ao criar relatório: ${JSON.stringify(errorData)}`);
        return;
      }

      const novoRelatorio = await relatorioResponse.json();

      if (fotosBlob.length > 0) {
        const fotosFormData = new FormData();
        fotosBlob.forEach(({ blob }) => {
          fotosFormData.append('imagens', blob, blob.name);
        });

        await fetch(`http://localhost:8000/api/relatorios/${novoRelatorio.id}/upload_fotos/`, {
          method: 'POST',
          body: fotosFormData,
        });
      }

      alert('Relatório criado com sucesso!');
      
      setData('');
      setClima('');
      setTrabalhadores([]);
      setEquipamentos([]);
      setDescricao('');
      setFotosBlob([]);
      setErroFotos('');

      if (onVoltarParaListaClick) {
        onVoltarParaListaClick();
      }
    } catch (error) {
      console.error('Erro:', error);
      alert(`Erro na comunicação: ${error.message}`);
    }
  };
  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <div className="adicionar-relatorio">
      <div className="header-adicionar-relatorio">
        {onVoltarParaListaClick && (
          <button 
            type="button" 
            onClick={onVoltarParaListaClick} 
            className="btn-voltar-seta"
          >
            ←
          </button>
        )}
        <h1 className="form-title">Adicionar Relatório</h1>
      </div>

      <form onSubmit={controllerRelatorio}>
        <div className="form-group">
          <label htmlFor="data" className="form-label">Data:</label>
          <input
            type="date"
            id="data"
            value={Data}
            onChange={(e) => setData(e.target.value)}
            className="form-control"
            required
            max={hoje}
          />
        </div>

        <div className="form-group">
          <label htmlFor="clima" className="form-label">Clima:</label>
          <select
            id="clima"
            value={Clima}
            onChange={(e) => setClima(e.target.value)}
            className="form-control"
            required
          >
            <option value="">Selecione o clima</option>
            {tiposClima.map((tipo, index) => (
              <option key={index} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            Trabalhadores:
            <button 
              type="button" 
              onClick={() => setMostrarFormTrabalhador(!mostrarFormTrabalhador)}
              className="btn-adicionar"
            >
              {mostrarFormTrabalhador ? 'Cancelar' : '+ Novo'}
            </button>
          </label>

          {mostrarFormTrabalhador && (
            <div className="form-cadastro-rapido">
              <input
                type="text"
                placeholder="Nome do Trabalhador"
                value={novoTrabalhador.nome}
                onChange={(e) => setNovoTrabalhador({ ...novoTrabalhador, nome: e.target.value })}
                className="form-control"
              />
              <input
                type="text"
                placeholder="Cargo"
                value={novoTrabalhador.funcao}
                onChange={(e) => setNovoTrabalhador({ ...novoTrabalhador, funcao: e.target.value })}
                className="form-control"
              />
              <button 
                type="button" 
                onClick={adicionarTrabalhador}
                className="btn-salvar"
                disabled={!novoTrabalhador.nome || !novoTrabalhador.funcao}
              >
                Salvar
              </button>
            </div>
          )}

          <select
            multiple
            value={Trabalhadores}
            onChange={handleTrabalhadoresChange}
            className="form-control"
            style={{ height: '100px' }}
            required={Trabalhadores.length === 0}
          >
            {availableTrabalhadores.map((worker) => (
              <option key={worker.id} value={worker.id}>{worker.nome} ({worker.funcao})</option>
            ))}
          </select>
          <small>Ctrl+Click (ou Cmd+Click) para seleção múltipla</small>
        </div>

      <div className="form-group">
        <label className="form-label">
          Equipamentos:
          <button 
            type="button" 
            onClick={() => setMostrarFormEquipamento(!mostrarFormEquipamento)}
            className="btn-adicionar"
          >
            {mostrarFormEquipamento ? 'Cancelar' : '+ Novo'}
          </button>
        </label>

        {mostrarFormEquipamento && (
          <div className="form-cadastro-rapido">
            <input
              type="text"
              placeholder="Nome do Equipamento"
              value={novoEquipamento.nome}
              onChange={(e) => setNovoEquipamento({ ...novoEquipamento, nome: e.target.value })}
              className="form-control"
            />
            <input
              type="text"
              placeholder="Tipo"
              value={novoEquipamento.tipo}
              onChange={(e) => setNovoEquipamento({ ...novoEquipamento, tipo: e.target.value })}
              className="form-control"
            />
            <button
              type="button"
              onClick={adicionarEquipamento}
              className="btn-salvar"
              disabled={!novoEquipamento.nome || !novoEquipamento.tipo}
            >
              Salvar
            </button>
          </div>
        )}


        <div className="checkbox-group">
          {availableEquipamentos.length === 0 && <p>Nenhum equipamento cadastrado.</p>}
          {availableEquipamentos.map((equip) => (
            <label key={equip.id} className="checkbox-label">
              <div>
                <input
                  type="checkbox"
                  value={equip.id}
                  checked={Equipamentos.includes(equip.id)}
                  onChange={() => handleEquipamentosChange(equip.id)}
                />
                {equip.nome} ({equip.tipo})
              </div>
            </label>
          ))}
        </div>
      </div>

        <div className="form-group">
          <label htmlFor="descricao" className="form-label">
            Descrição:
            <span className="char-counter">{Descricao.length}/1000</span>
          </label>
          <textarea
            id="descricao"
            value={Descricao}
            onChange={(e) => setDescricao(e.target.value.slice(0, 1000))}
            className="form-control"
            rows={5}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="fotos" className="form-label">
            Fotos (mín. {MIN_FOTOS}, máx. {MAX_FOTOS}):
          </label>
          <input
            type="file"
            id="fotos"
            multiple
            accept="image/*"
            onChange={handleFotoChange}
            className="form-control"
            onClick={(e) => { e.target.value = null }}
          />
          {erroFotos && <div className="error-message">{erroFotos}</div>}
          
          {fotosBlob.length > 0 && (
            <div className="fotos-preview-container">
              {fotosBlob.map((foto, index) => (
                <div key={index} className="foto-preview-item">
                  <img src={foto.previewUrl} alt={`Preview ${index}`} />
                  <button 
                    type="button" 
                    onClick={() => handleRemoverFoto(index)}
                    className="remover-foto-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <button type="submit" className="submit-button">
            Criar Relatório
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdicionarRelatorio;