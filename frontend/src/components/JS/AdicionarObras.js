// /frontend/src/components/JS/AdicionarObras.js

import React, { useState } from 'react';
import api from '../../services/api';
import './AdicionarObras.css';
import '../../App.css'; 

const AdicionarObras = ({ onObraCadastrada }) => {
    const [formData, setFormData] = useState({
        Nome: '',
        Endereco: '',
        Data_inicio: '',
        Data_fim: '',
        Descricao: '',
        Status: 'andamento', // Valor padrão definido no model
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.Nome || !formData.Endereco || !formData.Data_inicio) {
            setError('Os campos Nome, Endereço e Data de Início são obrigatórios.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const dataToSend = {
                ...formData,
                Data_fim: formData.Data_fim || null,
            };

            await api.post('/obras/', dataToSend);
            setSuccess('Obra cadastrada com sucesso!');
            
            setFormData({
                Nome: '', Endereco: '', Data_inicio: '', Data_fim: '', Descricao: '', Status: 'andamento',
            });

            if (onObraCadastrada) {
                onObraCadastrada();
            }

        } catch (err) {
            setError('Erro ao cadastrar a obra. Verifique os dados e tente novamente.');
            console.error("Erro no cadastro da obra:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="adicionar-obra-container">
            <h2>Adicionar Obra</h2>
            <form onSubmit={handleSubmit} className="obra-form">
                <div className="form-group">
                    <label htmlFor="Nome">Nome da Obra</label>
                    <input type="text" id="Nome" name="Nome" value={formData.Nome} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="Endereco">Endereço</label>
                    <textarea id="Endereco" name="Endereco" value={formData.Endereco} onChange={handleChange} required />
                </div>
                <div className="form-group-row">
                    <div className="form-group">
                        <label htmlFor="Data_inicio">Data de Início</label>
                        <input type="date" id="Data_inicio" name="Data_inicio" value={formData.Data_inicio} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="Data_fim">Data de Fim (Especulativo)</label>
                        <input type="date" id="Data_fim" name="Data_fim" value={formData.Data_fim} onChange={handleChange} required />
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="Descricao">Descrição</label>
                    <textarea id="Descricao" name="Descricao" value={formData.Descricao} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="Status">Status</label>
                    <select id="Status" name="Status" value={formData.Status} onChange={handleChange}>
                        <option value="andamento">Em andamento</option>
                        <option value="concluida">Concluída</option>
                        <option value="pausada">Em pausa</option>
                        <option value="cancelada">Cancelada</option>
                    </select>
                </div>

                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}

                <button type="submit" disabled={loading} className="btn-submit">
                    {loading ? 'Salvando...' : 'Adicionar Obra'}
                </button>
            </form>
        </div>
    );
};

export default AdicionarObras;