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

//1. componente interno Dashboard
const Dashboard = ({ mes, setMes }) => {
      <div className="dashboard-layout">
      <Header mes={mes} setMes={setMes}/>      
    <main className="main-content">
    
      
     {/*Fila superior: Resumen Global*/} 
       
        <section className="kpi-section">
           <GlobalComplianceCard mes={mes} />
        </section>
        </main>
        </div>
       }
        {/* Fila de Gráficos */}
        /*
        <section className="charts-grid">
          <div className="chart-container">
            <SectorComplianceChart mes={mes}/>
          </div>
         <div className="chart-container">
            <ProfessionalRankingChart mes={mes}/>
          </div>
        </section>
        <section className="full-width-chart">
          <div className="chart-container">
            <MomentComplianceChart mes={mes}/>
          </div>
        </section>
        <section className="full-width-chart">
          <SectorDetailDashboard />
        </section>
        </main>
        </div>
}
*/


// Componente para proteger rutas (Evita que entren sin Login)
const RutaProtegida = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" />;
    }
    return children;
};

function App() {
  const [mes, setMes] = useState(""); // "" significa "Ver todos"

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
              <Dashboard mes={mes} setMes={setMes} />
            </RutaProtegida>
          }
          />
        
        {/* Si alguien entra a la raíz "/", redirigir al dashboard (que lo mandará al login si no hay token) */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
