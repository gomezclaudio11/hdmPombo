import React from 'react';

function Header({ mes, setMes }) {
  return (
    <header className="header" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h1>Dashboard de Higiene Hospitalaria</h1>
      
      <div className="filtro-mes">
        <label htmlFor="mes-select">📅 Filtrar por Mes: </label>
        <select 
          id="mes-select" 
          value={mes} 
          onChange={(e) => setMes(e.target.value)}
          style={{ padding: '5px', borderRadius: '5px', marginLeft: '10px' }}
        >
          <option value="">Todos los meses</option>
          <option value="03">Marzo</option>
          <option value="04">Abril</option>
          <option value="07">Julio</option>
          <option value="08">Agosto</option>
          <option value="11">Noviembre</option>
          <option value="12">Diciembre</option>
          {/* Puedes agregar Diciembre si ya corregiste los datos */}
          <option value="12">Diciembre</option>
        </select>
      </div>
    </header>
  );
}

export default Header;