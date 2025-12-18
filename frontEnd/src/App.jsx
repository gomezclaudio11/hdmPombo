import './App.css'; // Mantenemos el CSS base
import GlobalComplianceCard from './components/GlobalComplianceCard';
import SectorComplianceChart from './components/SectorComplianceChart';
import ProfessionalRankingChart from './components/ProfessionalRankingChart';
import MomentComplianceChart from './components/MomentComplianceChart';
function App() {
  return (
    <div className="dashboard-layout">
      <header className="header">
        <h1>Dashboard de Higiene Hospitalaria</h1>
      </header>
      
    <main className="main-content">
        {/* Fila superior: Resumen Global */}
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
        </main>
      
    </div>
  );
}

export default App;
