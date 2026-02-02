import React, { useState } from 'react';
import './App.css'; // Mantenemos el CSS base
import GlobalComplianceCard from './components/GlobalComplianceCard';
import SectorComplianceChart from './components/SectorComplianceChart';
import ProfessionalRankingChart from './components/ProfessionalRankingChart';
import MomentComplianceChart from './components/MomentComplianceChart';
import SectorDetailDashboard from './components/SectorDetailDashboard';

function App() {
  const [mes, setMes] = useState(""); // "" significa "Ver todos"

  return (
    <div className="dashboard-layout">
      <header mes={mes} setMes={setMes}/>
      
    <main className="main-content">
        {/* Fila superior: Resumen Global */}
        <section className="kpi-section">
           <GlobalComplianceCard mes={mes} />
        </section>

        {/* Fila de Gráficos */}
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
  );
}

export default App;
