// /frontend/src/components/JS/ListaObras.js

import React, { useState, useEffect } from 'react';
import api from '../../services/api'; 

const ListaObras = ({onSelecionarObra}) => {

    console.log("-> Componente ListaObras foi chamado para renderizar!");
    const [obras, setObras] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("-> useEffect executado.");
        const fetchObras = async () => {
            try {
                console.log("-> Tentando fazer a chamada para api.get");
                const response = await api.get('/obras/'); 
                setObras(response.data);
            } catch (error) {
                console.error("Erro ao buscar as obras:", error);
            } finally {
                setLoading(false); 
            }
        };

        fetchObras();
    }, []); 

    if (loading) {
        return <p>Carregando obras...</p>;
    }

    return (
        <div>
            <h1 style={{marginLeft: '20px'}}>Obras</h1>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {obras.map(obra => (
                    <li 
                        key={obra.id} 
                        onClick={() => onSelecionarObra(obra.id)}
                        style={{ border: '3px solid #ccc', padding: '20px', marginBottom: '10px', cursor: 'pointer' }}
                    >
                        <h3 style={{ marginTop: 0, }}>{obra.Nome}</h3>
                        <p>Status: {obra.status_legivel}</p>
                        <p>Total de Relatórios: {obra.quantidade_relatorios}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ListaObras;