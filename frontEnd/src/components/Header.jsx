import React from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useFilters } from '../context/FilterContext';

const handleLogout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};

function Header() {
  const { mes, setMes, anio, setAnio } = useFilters();
  const token = localStorage.getItem('token');
  let user = null;
  
  if (token) {
    try {
      user = jwtDecode(token);
    } catch {
      console.error("Token inválido");
    }
  }

  return (
    <header className="header" style={{ 
      padding: '16px 32px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      backgroundColor: 'var(--card-bg)', 
      borderBottom: '1px solid var(--border-color)',
      flexWrap: 'wrap',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ 
          width: '42px', 
          height: '42px', 
          borderRadius: '10px', 
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.2rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          🏥
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-dark)' }}>HDM Pombo</h1>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span style={{ 
                fontSize: '0.75rem', 
                backgroundColor: '#EFF6FF', 
                color: 'var(--primary)', 
                padding: '2px 8px', 
                borderRadius: '9999px',
                fontWeight: 600,
                border: '1px solid #BFDBFE'
              }}>
                {user.role === 'admin' ? 'Administrador' : user.role === 'observer' ? 'Observador' : user.role}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.nombre}</span>
            </div>
          )}
        </div>
      </div>

      <nav style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: '600', fontSize: '0.95rem' }}>
          📊 Estadísticas
        </Link>

        {(user?.role === 'observer' || user?.role === 'admin') && (
          <Link 
            to="/cargar-datos" 
            style={{ 
              textDecoration: 'none', 
              backgroundColor: 'var(--success)', 
              color: 'white', 
              padding: '8px 16px', 
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.9rem',
              boxShadow: 'var(--shadow-sm)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'var(--transition)'
            }}
          >
            + Nueva Observación
          </Link>
        )}

        {/* Filtros de Fecha */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          borderLeft: '1px solid var(--border-color)', 
          paddingLeft: '20px',
          fontSize: '0.9rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label htmlFor="mes-select" style={{ fontWeight: '500', margin: 0 }}>📅 Mes:</label>
            <select 
              id="mes-select" 
              value={mes} 
              onChange={(e) => setMes(e.target.value)}
              style={{ 
                padding: '6px 10px', 
                borderRadius: '8px', 
                border: '1px solid var(--border-color)',
                backgroundColor: 'white',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">Todos</option>
              <option value="3">Marzo</option>
              <option value="4">Abril</option>
              <option value="7">Julio</option>
              <option value="8">Agosto</option>
              <option value="11">Noviembre</option>
              <option value="12">Diciembre</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label htmlFor="anio-select" style={{ fontWeight: '500', margin: 0 }}>Año:</label>
            <select 
              id="anio-select"
              value={anio} 
              onChange={(e) => setAnio(e.target.value)}
              style={{ 
                padding: '6px 10px', 
                borderRadius: '8px', 
                border: '1px solid var(--border-color)',
                backgroundColor: 'white',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleLogout} 
          style={{ 
            backgroundColor: '#FEE2E2', 
            color: '#991B1B', 
            border: '1px solid #FECACA', 
            padding: '8px 14px', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.9rem',
            transition: 'var(--transition)'
          }}
          title="Cerrar sesión"
        >
          Salir
        </button>
      </nav>
    </header>
  );
}

export default Header;
