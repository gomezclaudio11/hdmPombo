import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import GlobalComplianceCard from './components/GlobalComplianceCard';
import SectorComplianceChart from './components/SectorComplianceChart';
import ProfessionalRankingChart from './components/ProfessionalRankingChart';
import MomentComplianceChart from './components/MomentComplianceChart';
import SectorDetailDashboard from './components/SectorDetailDashboard';
import Login from './components/Login';
import FormularioObservacion from './components/FormularioObservacion';
import FormResgister from "./components/FormResgister";
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import { jwtDecode } from 'jwt-decode';

const Dashboard = () => {
  return (
    <div className="dashboard-layout">
      <Header />      
      <main className="main-content">
        <section className="kpi-section">
          <GlobalComplianceCard />
        </section>
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
  );
};

const RutaProtegida = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" />;
    }
    return children;
};

const RutaPorRol = ({ children, rolPermitido }) => {
    const token = localStorage.getItem('token');

    if (!token) return <Navigate to="/login" />;

    let decoded = null;
    try {
      decoded = jwtDecode(token);
    } catch {
      return <Navigate to="/login" />;
    }

    if (rolPermitido && decoded.role !== rolPermitido && decoded.role !== "admin") {
      return <Navigate to="/dashboard" />;
    }

    return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<FormResgister />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password' element={<ResetPassword />} />

        <Route
          path='/dashboard'
          element={
            <RutaProtegida>
              <Dashboard />
            </RutaProtegida>
          }
        />

        <Route path='/cargar-datos' element={
            <RutaPorRol rolPermitido="observer">
                <FormularioObservacion />
            </RutaPorRol>
        } />
        
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
