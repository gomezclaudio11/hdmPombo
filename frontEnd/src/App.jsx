import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'; // Mantenemos el CSS base
import Header from './components/Header';
import GlobalComplianceCard from './components/GlobalComplianceCard';
import SectorComplianceChart from './components/SectorComplianceChart';
import ProfessionalRankingChart from './components/ProfessionalRankingChart';
import MomentComplianceChart from './components/MomentComplianceChart';
import SectorDetailDashboard from './components/SectorDetailDashboard';
import Login from './components/Login';
import FormularioObservacion from './components/FormularioObservacion';
import { jwtDecode } from 'jwt-decode';

//1. componente interno Dashboard
const Dashboard = ({ mes, setMes, anio, setAnio }) => {
  return(
      <div className="dashboard-layout">
      <Header mes={mes} setMes={setMes} anio={anio} setAnio={setAnio}/>      
    <main className="main-content">
       
     {/*Fila superior: Resumen Global*/} 
       
        <section className="kpi-section">
           <GlobalComplianceCard mes={mes} anio={anio} />
        </section>
     
     {/* Fila de Gráficos */}
        <section className="charts-grid">
          <div className="chart-container">
            <SectorComplianceChart mes={mes} anio={anio}/>
          </div>
         <div className="chart-container">
            <ProfessionalRankingChart mes={mes} anio={anio}/>
          </div>
        </section>
        <section className="full-width-chart">
          <div className="chart-container">
            <MomentComplianceChart mes={mes} anio={anio}/>
          </div>
        </section>
        <section className="full-width-chart">
          <SectorDetailDashboard mes={mes} anio={anio}/>
        </section>
        </main>
        </div>
  )
}

// Componente para proteger rutas (Evita que entren sin Login)
const RutaProtegida = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" />;
    }
    return children;
};

// Componente para proteger rutas (Evita que entren sin Login)
const RutaPorRol = ({ children, rolPermitiido }) => {
    const token = localStorage.getItem('token');

    if (!token) return <Navigate to="/login" />;

    try {
      const decoded = jwtDecode(token);
      //si el usuario no tiene el rol necesario, lo mandamos al dashboard solo lectura
      if (rolPermitiido && decoded.rol !== rolPermitiido && decoded.rol !== "admin") {
        return <Navigate to= "/ dashboard" />
      }
      return children
    } catch (error) {
      return <Navigate to= "/login" />
    }
};

function App() {
  const [mes, setMes] = useState(""); // "" significa "Ver todos"
  const [anio, setAnio] = useState("2025")

  return (
    <Router>
      <Routes>
        {/* Rutas del login*/}
        <Route path='/login' element={<Login />} />

        {/** Ruta del Dashboard protegidas */}
        <Route
          path='/dashboard'
          element={
            <RutaProtegida>
              <Dashboard mes={mes} setMes={setMes} anio={anio} setAnio={setAnio} />
            </RutaProtegida>
          }
          />

          {/* El Formulario SOLO lo ven Observadores (y el Admin por ser superior) */}
        <Route path='/cargar-datos' element={
            <RutaPorRol rolPermitido="observador">
                <FormularioObservacion />
            </RutaPorRol>
        } />
        
        {/* Si alguien entra a la raíz "/", redirigir al dashboard (que lo mandará al login si no hay token) */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
