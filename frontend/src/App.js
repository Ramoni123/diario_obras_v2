import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/JS/Header';
import FormularioRelatorio from './components/JS/FormularioRelatorio'; 
import ListaRelatorios from './components/JS/ListaRelatorios';
import VisualizarRelatorio from './components/JS/VisualizarRelatorio';
import ListaObras from './components/JS/ListaObras';
import api from './services/api';

function App() {
  const [viewAtual, setViewAtual] = useState('listaObras'); 
  const [obraSelecionadaId, setObraSelecionadaId] = useState(null)
  const [relatorioSelecionado, setRelatorioSelecionado] = useState(null);
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRelatorios = async () => {
    try {
      setLoading(true);
      if (!obraSelecionadaId) {
      setRelatorios([]); 
      setLoading(false);
      return;
    }
      const response = await api.get('relatorios/');
      setRelatorios(response.data);
      setError(null);
    } catch (err) {
      setError("Erro ao carregar relatórios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewAtual == 'lista');{
      fetchRelatorios()
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

  useEffect(() => {
    if (viewAtual === 'lista') {
      fetchRelatorios();
    }
  }, [viewAtual]);

  const irParaAdicionarRelatorio = () => {
    setRelatorioSelecionado(null);
    setViewAtual('formulario');
  };
  
  const irParaEditarRelatorio = (relatorio) => {
    setRelatorioSelecionado(relatorio);
    setViewAtual('formulario'); //Depois disso chama a handleSaveRelatorio
  };

  const irParaVisualizarRelatorio = (idDoRelatorio) => {
    setRelatorioSelecionado({ id: idDoRelatorio });
    setViewAtual('visualizar');
  };

  const irParaListaDeRelatorios = () => {
    setRelatorioSelecionado(null);
    setViewAtual('lista');
  };

  // FUNÇÃO CORRIGIDA - handleSaveRelatorio
  const handleSaveRelatorio = async (relatorioData, fotosBlob, fotosRemovidasIds) => {
    const isEditing = !!relatorioSelecionado;
    
    console.log('Dados recebidos do formulário:', relatorioData);
    
    const dadosParaBackend = {
      Data: relatorioData.Data,
      Clima_input: relatorioData.Clima_input, // Mudança: usar Clima_input em vez de Clima
      Trabalhadores: relatorioData.Trabalhadores,
      equipamentos_com_quantidade: relatorioData.equipamentos_com_quantidade, // Para os equipamentos não ficarem com quantidades iguais em cards diferentes
      Descricao: relatorioData.Descricao,
    };

    console.log('Dados sendo enviados para o backend:', dadosParaBackend);

    const url = isEditing ? `relatorios/${relatorioSelecionado.id}/` : 'relatorios/';
    const method = isEditing ? 'put' : 'post';

    try {
      const response = await api[method](url, dadosParaBackend); //Enviar requisição pra URL
      const relatorioSalvo = response.data;
      const relatorioId = relatorioSalvo.id;

      console.log('Relatório salvo:', relatorioSalvo);

      // CORREÇÃO 2: Melhorar tratamento de fotos
      if (isEditing && fotosRemovidasIds && fotosRemovidasIds.length > 0) {
        console.log('Removendo fotos:', fotosRemovidasIds);
        await api.post(`relatorios/${relatorioId}/remover_fotos/`, { ids: fotosRemovidasIds });
      }

      if (fotosBlob && fotosBlob.length > 0) {
        console.log('Enviando fotos:', fotosBlob);
        const fotosFormData = new FormData();
        
        fotosBlob.forEach((foto, index) => {
          // Verificar se é um objeto com blob ou apenas o blob
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
        
        // CORREÇÃO 3: Melhor tratamento de erros
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

  return (
    <div className="App">
      <Header />
      
      {viewAtual === 'lista' && (
        <ListaRelatorios
          relatorios={relatorios} loading={loading} error={error}
          onVerDetalhes={irParaVisualizarRelatorio}
          onAdicionarClick={irParaAdicionarRelatorio}
          onEditarClick={irParaEditarRelatorio}
          onDeleteSuccess={fetchRelatorios}
          onVoltarParaObras={irParaListaDeObras}
          obraId={obraSelecionadaId}
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

      {viewAtual === 'listaObras' && (
        <ListaObras
          onSelecionarObra={irParaListaDeRelatoriosDaObra}
        />
      )}
    </div>
  );
}

export default App;