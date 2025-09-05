import React, { useState, useEffect, use } from 'react';
import './App.css';
import Header from './components/JS/Header';
import { Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import FormularioRelatorio from './components/JS/FormularioRelatorio'; 
import ListaRelatorios from './components/JS/ListaRelatorios';
import VisualizarRelatorio from './components/JS/VisualizarRelatorio';
import ListaObras from './components/JS/ListaObras';
import api from './services/api';
import AdicionarObras from './components/JS/AdicionarObras';
import VisualizarObras from './components/JS/VisualizarObras';
import FormularioObras from './components/JS/FormularioObras';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/JS/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

function PaginaListaObras(){
    const [obras, setObras] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        api.get('/obras/').then(response => {
            setObras(response.data);
            setLoading(false);
        }).catch(error => {
            console.error("Erro ao buscar obras:", error);
            setLoading(false);
        });
    }, []);

    const handleExcluirObra = async (obraId) => {
        if (window.confirm("Tem certeza que deseja excluir esta obra?")) {
            await api.delete(`/obras/${obraId}/`);
            setObras(obras.filter(o => o.id !== obraId));
        }
    };

    return (
        <ListaObras
            obras={obras}
            loading={loading}
            onSelecionarObra={(id) => navigate(`/obras/${id}/relatorios`)}
            onAdicionarObra={() => navigate('/obras/adicionar')}
            onVisualizarObra={(id) => navigate(`/obras/${id}`)}
            onEditarObra={(obra) => navigate(`/obras/editar/${obra.id}`)}
            onExcluirObra={handleExcluirObra}
        />
    );
}

function PaginaFormularioObra() {
    const navigate = useNavigate();
    const { id } = useParams(); 
    const [obraParaEditar, setObraParaEditar] = useState(null);
    const isEditing = !!id;

    useEffect(() => {
        if (isEditing) {
            api.get(`/obras/${id}/`).then(response => {
                setObraParaEditar(response.data);
            });
        }
    }, [id, isEditing]);

    const handleSaveObra = async (dadosDaObra) => {
        try {
            if (isEditing) {
                await api.put(`/obras/${id}/`, dadosDaObra);
            } else {
                await api.post('/obras/', dadosDaObra);
            }
            navigate('/'); 
        } catch (error) {
            console.error("Erro ao salvar a obra:", error);
            alert("Falha ao salvar a obra.");
        }
    };
    
    if(isEditing && !obraParaEditar) return <p>Carregando dados da obra...</p>;

    return (
        <FormularioObras
            onSave={handleSaveObra}
            onVoltar={() => navigate('/')}
            obraParaEditar={obraParaEditar}
        />
    );
}

function PaginaVisualizarObra() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    return <VisualizarObras obraId={id} onVoltar={() => navigate('/')} />
}

function PaginaListaRelatorios() {
    const { obraId } = useParams();
    const navigate = useNavigate();
    const [relatorios, setRelatorios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mesFiltro, setMesFiltro] = useState('');

    const fetchRelatorios = () => {
        setLoading(true);
        api.get('/relatorios/', { params: { obra: obraId, mes: mesFiltro || undefined } })
            .then(response => {
                setRelatorios(response.data);
            })
            .catch(error => {
                console.error("Erro ao buscar relatórios:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    useEffect(() => {
        if (obraId) {
            fetchRelatorios();
        }
    }, [obraId, mesFiltro]);
    
    const handleMesChange = (novoMes) => {
        setMesFiltro(novoMes);
    };

    return (
        <ListaRelatorios
            relatorios={relatorios}
            loading={loading}
            error={null} 
            obraId={obraId}
            onAdicionarClick={() => navigate(`/obras/${obraId}/relatorios/adicionar`)}
            onEditarClick={(relatorio) => navigate(`/obras/${obraId}/relatorios/editar/${relatorio.id}`)}
            onVerDetalhes={(relatorioId) => navigate(`/relatorios/${relatorioId}`)}
            onDeleteSuccess={fetchRelatorios}
            onVoltarParaObras={() => navigate('/obras')}
            mesSelecionado={mesFiltro}
            onChangeMes={handleMesChange}
        />
    );
}

function PaginaFormularioRelatorio() {
    const navigate = useNavigate();
    const { obraId, relatorioId } = useParams();
    const [relatorioParaEditar, setRelatorioParaEditar] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false)
    const isEditing = !!relatorioId;

    useEffect(() => {
        if (isEditing) {
            api.get(`/relatorios/${relatorioId}/`).then(response => {
                setRelatorioParaEditar(response.data);
            });
        }
    }, [relatorioId, isEditing]);

const handleSaveRelatorio = async (relatorioData, fotosBlob, fotosRemovidasIds) => {
    setIsSubmitting(true);
    console.log("Dados recebidos em App.js para salvar:", relatorioData); 
    console.log("Fotos recebidas para upload:", fotosBlob);

    try {
        let relatorioSalvo;
        if (isEditing) {
            const response = await api.put(`/relatorios/${relatorioId}/`, relatorioData);
            relatorioSalvo = response.data;
        } else {
            const dadosComObraId = { ...relatorioData, obra: obraId };
            const response = await api.post('/relatorios/', dadosComObraId);
            relatorioSalvo = response.data;
        }
        
        const idDoRelatorioSalvo = relatorioSalvo.id;

        if (fotosBlob && fotosBlob.length > 0) {
            const fotosFormData = new FormData();
            
            fotosBlob.forEach(foto => {
                fotosFormData.append('imagens', foto.blob, foto.blob.name);
            });
            
            await api.post(`/relatorios/${idDoRelatorioSalvo}/upload_fotos/`, fotosFormData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        }
        
        if (isEditing && fotosRemovidasIds && fotosRemovidasIds.length > 0) {
             console.log("IDs de fotos a remover:", fotosRemovidasIds);
        }

        alert(`Relatório ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
        const idObraDestino = relatorioSalvo.Obra || obraId;
        navigate(`/obras/${idObraDestino}/relatorios`);

    } catch (error) {
        console.error("Erro ao salvar o relatório:", error.response?.data || error);
        const erroMsg = error.response?.data ? JSON.stringify(error.response.data) : "Falha ao salvar o relatório.";
        alert(erroMsg);
    } finally {
        setIsSubmitting(false);
    }
};

    if (isEditing && !relatorioParaEditar) return <p>Carregando dados do relatório...</p>;

    return (
        <FormularioRelatorio
            onSave={handleSaveRelatorio}
            onVoltar={() => navigate(-1)}
            relatorioParaEditar={relatorioParaEditar}
            isSubmitting={isSubmitting} 
        />
    );
}

function PaginaVisualizarRelatorio() {
    const { relatorioId } = useParams();
    const navigate = useNavigate();

    return <VisualizarRelatorio relatorioId={relatorioId} onVoltarParaListaClick={() => navigate(-1)} />
}

function App() {
    return (
            <AuthProvider>
                <div className="App">
                    <Header /> 
                    <main>
                        <Routes>
                            <Route path="/" element={<LoginPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/acesso-negado" element={<h2>Acesso Negado</h2>} />
                            <Route element={<ProtectedRoute />}>
                                <Route path="/obras" element={<PaginaListaObras />} />
                                <Route path="/obras/:id" element={<PaginaVisualizarObra />} />
                                <Route path="/obras/:obraId/relatorios" element={<PaginaListaRelatorios />} />
                                <Route path="/obras/:obraId/relatorios/adicionar" element={<PaginaFormularioRelatorio />} />
                                <Route path="/obras/:obraId/relatorios/editar/:relatorioId" element={<PaginaFormularioRelatorio />} />
                                <Route path="/relatorios/:relatorioId" element={<PaginaVisualizarRelatorio />} />
                            </Route>
                            <Route element={<ProtectedRoute roles={['Administradores']} />}>
                                <Route path="/obras/adicionar" element={<PaginaFormularioObra />} />
                                <Route path="/obras/editar/:id" element={<PaginaFormularioObra />} />
                            </Route>
                        </Routes>
                    </main>
                </div>
            </AuthProvider>
    );
}


export default App;