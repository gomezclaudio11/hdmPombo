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
      <header className="header">
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
            <option value="07">Julio</option>
            <option value="11">Noviembre</option>
          </select>
        </div>
      </header>
      
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
