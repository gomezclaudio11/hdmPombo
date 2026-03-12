import React from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const handleLogout = () => {
  //1. se borra el token
  localStorage.removeItem("token");
  //2 redirigimos al login
  window.location.href = "/login"
}

function Header({ mes, setMes, anio, setAnio }) {
  // 1. Extraemos el usuario del token para saber su rol
    const token = localStorage.getItem('token');
    let user = null;
    
    if (token) {
        try {
            user = jwtDecode(token);
        } catch (error) {
            console.error("Token inválido");
        }
    }

  return (
    <header className="header" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h1 style={{ margin: 0, fontSize: '1.5rem' }}>HDM Pombo</h1>
                {/* Mostramos un saludo personalizado (opcional) */}
                {user && <small style={{ color: '#666' }}>Hola, {user.nombre} ({user.role})</small>}
            </div>

            <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                {/* Link visible para todos los logueados */}
                <Link to="/dashboard" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>
                    Estadísticas
                </Link>

                {/* BOTÓN CONDICIONAL: Solo para observer o admin */}
                {(user?.role === 'observer' || user?.role === 'admin') && (
                    <Link 
                        to="/cargar-datos" 
                        style={{ 
                            textDecoration: 'none', 
                            backgroundColor: '#28a745', 
                            color: 'white', 
                            padding: '8px 15px', 
                            borderRadius: '5px',
                            fontWeight: 'bold'
                        }}
                    >
                        + Nueva Observación
                    </Link>
                )}

                {/* Filtro de Mes (Solo se muestra en el Dashboard) */}
                <div className="filtro-mes" style={{ borderLeft: '1px solid #ccc', paddingLeft: '20px' }}>
                    <label htmlFor="mes-select">📅 Mes: </label>
                    <select 
                        id="mes-select" 
                        value={mes} 
                        onChange={(e) => setMes(e.target.value)}
                        style={{ padding: '5px', borderRadius: '5px' }}
                    >
                        <option value="">Ver Todos</option>
                        <option value="3">Marzo</option>
                        <option value="4">Abril</option>
                        <option value="7">Julio</option>
                        <option value="8">Agosto</option>
                        <option value="11">Noviembre</option>
                        <option value="12">Diciembre</option>
                    </select>
                    <label >📅 Año: </label>
                    {/* Selector de Año */}
                    <select value={anio} onChange={(e) => setAnio(e.target.value)}>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    </select>
                </div>

                <button onClick={handleLogout} className="logout-button" style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
                    Salir
                </button>
            </nav>
        </header>
  );
}

export default Header;