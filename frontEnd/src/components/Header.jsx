import React from 'react';

const handleLogout = () => {
  //1. se borra el token
  localStorage.removeItem("token");

  //2 redirigimos al login
  window.location.href = "/login"
}

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
        </select>
      </div>
      <div>
        <button onClick={handleLogout} className="logout-button">
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
}

export default Header;