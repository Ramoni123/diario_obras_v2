import React from 'react';
import './FiltroMes.css'; 

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const FiltroMes = ({ mesSelecionado, onChangeMes }) => {
  return (
    <div className="filtro-container">
      <label htmlFor="filtro-mes" className="filtro-label">Filtrar por mês:</label>
      <select
        id="filtro-mes"
        className="filtro-select"
        value={mesSelecionado}
        onChange={(e) => onChangeMes(e.target.value)}
      >
        <option value="">Todos os meses</option>
        {MESES.map((mes, index) => (
          <option key={index} value={index + 1}>
            {mes}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FiltroMes;