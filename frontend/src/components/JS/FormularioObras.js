import React, { useState, useEffect } from 'react';
import App from '../../App';
import './FormularioObras.css';

const FormularioObras = ({ onSave, onVoltar, obraParaEditar, onVoltarParaObra }) => {
    const [nome, setNome] = useState('');
    const [endereco, setEndereco] = useState('');
    const [descricao, setDescricao] = useState('');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [status, setStatus] = useState('andamento');

    const titulo = obraParaEditar ? "Editar Obra" : "Adicionar Nova Obra";

    useEffect(() => {
        if (obraParaEditar) {
            setNome(obraParaEditar.Nome || '');
            setEndereco(obraParaEditar.Endereco || '');
            setDescricao(obraParaEditar.Descricao || '');
            setDataInicio(obraParaEditar.Data_inicio ? obraParaEditar.Data_inicio.split('T')[0] : '');
            setDataFim(obraParaEditar.Data_fim ? obraParaEditar.Data_fim.split('T')[0] : '');
            setStatus(obraParaEditar.Status || 'andamento');
        } else {
            setNome('');
            setEndereco('');
            setDescricao('');
            setDataInicio('');
            setDataFim('');
            setStatus('andamento');
        }
    }, [obraParaEditar]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!nome.trim()) {
            alert('O nome da obra é obrigatório.');
            return;
        }
        const dadosDaObra = {
            Nome: nome,
            Endereco: endereco,
            Descricao: descricao,
            Data_inicio: dataInicio,
            Data_fim: dataFim,
            Status: status,
        };
        onSave(dadosDaObra);
    };

    return (
        <div className="formulario-container">
            <form onSubmit={handleSubmit}>
                <h2>{titulo}</h2>

                <div className="form-group">
                    <label htmlFor="nome">Nome da Obra</label>
                    <input
                        type="text"
                        id="nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="endereco">Endereço</label>
                    <input
                        type="text"
                        id="endereco"
                        value={endereco}
                        onChange={(e) => setEndereco(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="descricao">Descrição</label>
                    <textarea
                        id="descricao"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="dataInicio">Data de Início</label>
                    <input
                        type="date"
                        id="dataInicio"
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="dataFim">Data de Fim Prevista</label>
                    <input
                        type="date"
                        id="dataFim"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="andamento">Em Andamento</option>
                        <option value="concluida">Concluída</option>
                        <option value="pausada">Pausada</option>
                        <option value="cancelada">Cancelada</option>
                    </select>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-salvar">Salvar Obra</button>
                    <button type="button" onClick={onVoltarParaObra} className="btn-cancelar">Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default FormularioObras;
