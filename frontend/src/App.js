import React, { useState, useEffect, use } from 'react';
import './App.css';
import Header from './components/JS/Header';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import FormularioRelatorio from './components/JS/FormularioRelatorio'; 
import ListaRelatorios from './components/JS/ListaRelatorios';
import VisualizarRelatorio from './components/JS/VisualizarRelatorio';
import ListaObras from './components/JS/ListaObras';
import api from './services/api';
import AdicionarObras from './components/JS/AdicionarObras';
import VisualizarObras from './components/JS/VisualizarObras';
import FormularioObras from './components/JS/FormularioObras';

function App() {
  const [viewAtual, setViewAtual] = useState('listaObras'); 
  const [obraSelecionadaId, setObraSelecionadaId] = useState(null)
  const [relatorioSelecionado, setRelatorioSelecionado] = useState(null);
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mes, setMes] = useState('')
  const [obras, setObras] = useState('')
  const [loadingObras, setLoadingObras] = useState('true')
  const [obraParaEditar, setObraParaEditar] = useState(null)

  const fetchRelatorios = async (obraId) => {
    try {
      setLoading(true);
      if (!obraSelecionadaId) {
      setRelatorios([]); 
      setLoading(false);
      return;
    }
      const response = await api.get('relatorios/',{
        params :{
          Obra: obraId
        }
      });
      setRelatorios(response.data);
      setError(null);
    } catch (err) {
      setError("Erro ao carregar relatórios.");
    } finally {
      setLoading(false);
    }
  };

  const fetchObras = async() => {
    try {
      setLoadingObras(true);
      const response = await api.get('/obras/');
      setObras(response.data);
    } catch(error) {
      console.error("Erro ao buscar obras: ", error);
    } finally {
      setLoadingObras(false)
    }
  }

  useEffect (() => {
    if (viewAtual === 'listaObras') {
      fetchObras();
    }
  }, [viewAtual]);


  useEffect(() => {
    if (viewAtual === 'lista' && obraSelecionadaId){
      fetchRelatorios(obraSelecionadaId)
    }
  }, [viewAtual, obraSelecionadaId]);

  const irParaListaDeObras = () => {
    setViewAtual('listaObras');
    setObraSelecionadaId(null)
  };

  const irParaListaDeRelatoriosDaObra = (idDaObra) => {
    setObraSelecionadaId(idDaObra);
    setViewAtual('lista')
  }

  const irParaAdicionarRelatorio = () => {
    setRelatorioSelecionado(null);
    setViewAtual('formulario');
  };
  
  const irParaEditarRelatorio = (relatorio) => {
    setRelatorioSelecionado(relatorio);
    setViewAtual('formulario'); 
  };

  const irParaVisualizarRelatorio = (idDoRelatorio) => {
    setRelatorioSelecionado({ id: idDoRelatorio });
    setViewAtual('visualizar');
  };

  const irParaAdicionarObra = () => {
    setObraParaEditar(null)
    setViewAtual('formularioObra');
  };

  const irParaEditarObra = (obra) => {
    setObraParaEditar(obra)
    setViewAtual('formularioObra')
  }
  
  const irParaVisualizarObra = (idDaObra) => {
    setObraSelecionadaId(idDaObra)
    setViewAtual("visualizarObra")
  }

  const handleVoltarParaLista = () => {
    setObraSelecionadaId(null)
    setViewAtual("lista")
  }

  const irParaListaDeRelatorios = () => {
    setRelatorioSelecionado(null);
    setViewAtual('lista');
  };

  const handleMudancaDeMes = (novoMes) => {
    setMes(novoMes);
  }

  const handleSaveRelatorio = async (relatorioData, fotosBlob, fotosRemovidasIds) => {
    const isEditing = !!relatorioSelecionado;
    
    console.log('Dados recebidos do formulário:', relatorioData);
    
    const dadosParaBackend = {
      obra: obraSelecionadaId,
      Data: relatorioData.Data,
      Clima_input: relatorioData.Clima_input, 
      Trabalhadores: relatorioData.Trabalhadores,
      equipamentos_com_quantidade: relatorioData.equipamentos_com_quantidade, 
      Descricao: relatorioData.Descricao,
    };

    console.log('Dados sendo enviados para o backend:', dadosParaBackend);

    const url = isEditing ? `relatorios/${relatorioSelecionado.id}/` : 'relatorios/';
    const method = isEditing ? 'put' : 'post';

    try {
      const response = await api[method](url, dadosParaBackend); 
      const relatorioSalvo = response.data;
      const relatorioId = relatorioSalvo.id;

      console.log('Relatório salvo:', relatorioSalvo);

      if (isEditing && fotosRemovidasIds && fotosRemovidasIds.length > 0) {
        console.log('Removendo fotos:', fotosRemovidasIds);
        await api.post(`relatorios/${relatorioId}/remover_fotos/`, { ids: fotosRemovidasIds });
      }

      if (fotosBlob && fotosBlob.length > 0) {
        console.log('Enviando fotos:', fotosBlob);
        const fotosFormData = new FormData();
        
        fotosBlob.forEach((foto, index) => {
          const arquivo = foto.file || foto.blob || foto;
          const nomeArquivo = foto.name || `foto_${index}.jpg`;
          fotosFormData.append('imagens', arquivo, nomeArquivo);
        });
        
        await api.post(`relatorios/${relatorioId}/upload_fotos/`, fotosFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      alert(`Relatório ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
      irParaListaDeRelatorios();

    } catch (err) {
      console.error('Erro completo:', err);
      console.error('Response do erro:', err.response);
      
      let errorMessage = 'Erro desconhecido';
      
      if (err.response && err.response.data) {
        console.log('Dados do erro:', err.response.data);
        
        const errorData = err.response.data;
        const errorMessages = [];
        
        Object.entries(errorData).forEach(([campo, mensagem]) => {
          if (Array.isArray(mensagem)) {
            errorMessages.push(`${campo}: ${mensagem.join(', ')}`);
          } else if (typeof mensagem === 'string') {
            errorMessages.push(`${campo}: ${mensagem}`);
          } else {
            errorMessages.push(`${campo}: ${JSON.stringify(mensagem)}`);
          }
        });
        
        errorMessage = errorMessages.join('\n');
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(`Falha ao salvar o relatório:\n\n${errorMessage}`);
    }
  };

  console.log("--- Renderizando App.js ---");
  console.log("O valor de 'viewAtual' é:", viewAtual);

const relatoriosFiltrados = mes
  ? relatorios.filter(relatorio => {
      const mesDoRelatorio = new Date(relatorio.Data).getMonth() + 1;

      return mesDoRelatorio === parseInt(mes);
  })
  : relatorios;

  const handleObraCadastrada = () => {
    setViewAtual('listaObras')
  }

    const handleExcluirObra = async (obraId) => {
        const confirmou = window.confirm("Tem certeza que deseja excluir esta obra? Esta ação não pode ser desfeita.");
        if (confirmou) {
            try {
                await api.delete(`/obras/${obraId}/`);
                setObras(obrasAtuais => obrasAtuais.filter(obra => obra.id !== obraId));
                alert("Obra excluída com sucesso!");
            } catch (error) {
                console.error("Erro ao excluir a obra:", error);
                alert("Não foi possível excluir a obra. Tente novamente.");
            }
        }
    };

    const handleSaveObra = async (dadosDaObra) => {
      try {
        if (obraParaEditar) {
          const response = await api.put(`/obras/${obraParaEditar.id}/`, dadosDaObra);
                setObras(obrasAtuais =>
                    obrasAtuais.map(obra =>
                        obra.id === obraParaEditar.id ? response.data : obra
                    )
                );
                alert("Obra atualizada")
        } else {
          const response = await api.post('/obras/', dadosDaObra)
                setObras(obrasAtuais => [...obrasAtuais, response.data]);
                alert("Obra criada com sucesso!");
        }
        irParaListaDeObras()
      } catch (error) {
            console.error("Erro ao salvar a obra:", error.response?.data || error.message);
            alert("Falha ao salvar a obra.");
      }
    };

  return (
    <div className="App">
      <Header />
      {viewAtual === 'lista' && (
        <ListaRelatorios
          onVerDetalhes={irParaVisualizarRelatorio}
          onVisualizarObra={irParaVisualizarObra}
          onAdicionarClick={irParaAdicionarRelatorio}
          onEditarClick={irParaEditarRelatorio}
          onDeleteSuccess={fetchRelatorios}
          onVoltarParaObras={irParaListaDeObras}
          relatorios={relatoriosFiltrados}
          obraId={obraSelecionadaId}
          mesSelecionado={mes}
          onChangeMes={handleMudancaDeMes}
        />
      )}

      {viewAtual === 'formulario' && (
        <FormularioRelatorio
          onSave={handleSaveRelatorio}
          onVoltar={irParaListaDeRelatorios}
          relatorioParaEditar={relatorioSelecionado}
        />
      )}
      
      {viewAtual === 'visualizar' && relatorioSelecionado && (
        <VisualizarRelatorio
          relatorioId={relatorioSelecionado.id}
          onVoltarParaListaClick={irParaListaDeRelatorios}
          onEditarClick={irParaEditarRelatorio}
        />
      )}

      {viewAtual === 'adicionarObra' && (
        <AdicionarObras onObraCadastrada={handleObraCadastrada}/>
      )}

      {viewAtual === "visualizarObra" && (
        <VisualizarObras 
        obraId = {obraSelecionadaId}
        onVoltar = {irParaListaDeObras}
        />
      )}

      {viewAtual === "formularioObra" && (
        <FormularioObras
        onSave={handleSaveObra}
        onVoltar={irParaListaDeObras}
        obraParaEditar={obraParaEditar}
        />
      )}

      {viewAtual === 'listaObras' && (
        <ListaObras
          obras = {obras}
          loading = {loadingObras}
          onSelecionarObra  = {irParaListaDeRelatoriosDaObra}
          onAdicionarObra = {irParaAdicionarObra}
          onVisualizarObra = {irParaVisualizarObra}
          onExcluirObra={handleExcluirObra}
          onEditarObra={irParaEditarObra}
        />  
      )}
    </div>
  );
}

export default App;