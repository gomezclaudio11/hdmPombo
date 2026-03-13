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
import FormResgister from "./components/FormResgister"
import { jwtDecode } from 'jwt-decode';

//1. componente interno Dashboard
const Dashboard = () => {
  return(
      <div className="dashboard-layout">
      <Header />      
    <main className="main-content">
       
     {/*Fila superior: Resumen Global*/} 
       
        <section className="kpi-section">
           <GlobalComplianceCard />
        </section>
     
     {/* Fila de Gráficos */}
        <section className="charts-grid">
          <div className="chart-container">
            <SectorComplianceChart />
          </div>
         <div className="chart-container">
            <ProfessionalRankingChart />
          </div>
        </section>
        <section className="full-width-chart">
          <div className="chart-container">
            <MomentComplianceChart />
          </div>
        </section>
        <section className="full-width-chart">
          <SectorDetailDashboard />
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
const RutaPorRol = ({ children, rolPermitido }) => {
    const token = localStorage.getItem('token');

    if (!token) return <Navigate to="/login" />;

    try {
      const decoded = jwtDecode(token);
      //si el usuario no tiene el rol necesario, lo mandamos al dashboard solo lectura
      if (rolPermitido && decoded.role !== rolPermitido && decoded.role !== "admin") {
        return <Navigate to= "/dashboard" />
      }
      return children
    } catch (error) {
      return <Navigate to= "/login" />
    }
};

function App() {

  return (
    <Router>
      <Routes>
        {/* Rutas del Publicas sin token*/}
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<FormResgister />} />

        {/** Ruta del Dashboard protegidas */}
        <Route
          path='/dashboard'
          element={
            <RutaProtegida>
              <Dashboard />
            </RutaProtegida>
          }
          />

          {/* El Formulario SOLO lo ven Observadores (y el Admin por ser superior) */}
        <Route path='/cargar-datos' element={
            <RutaPorRol rolPermitido="observer">
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
