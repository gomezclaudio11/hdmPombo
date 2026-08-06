import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import clienteAxios from '../api/axiosConfig';
import { useFilters } from '../context/FilterContext';

const SECTORES = ["UTI ADULTO", "GUARDIA", "4to piso", "5to piso", "6to piso", "7mo piso"];

function SectorDetailDashboard() {
  const { mes, anio } = useFilters();
  const [sectorSeleccionado, setSectorSeleccionado] = useState(SECTORES[0]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDetalleData = async () => {
      setLoading(true);
      try {
        const response = await clienteAxios.get(`/observaciones/stats-sector-detalle/${encodeURIComponent(sectorSeleccionado)}?anio=${anio}${mes ? `&mes=${mes}` : ''}`);
        const data = response.data;

        setChartData({
          labels: data.map(item => item.personal),
          datasets: [
            {
              label: `% Cumplimiento en ${sectorSeleccionado}`,
              data: data.map(item => item.porcentajeCumplimiento),
              backgroundColor: 'rgba(139, 92, 246, 0.75)', // Violet
              borderColor: 'rgba(139, 92, 246, 1)',
              borderWidth: 1.5,
              borderRadius: 6,
            },
          ],
        });
      } catch (error) {
        console.error("Error cargando detalle por sector:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetalleData();
  }, [sectorSeleccionado, mes, anio]);

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: { 
      x: { 
        beginAtZero: true, 
        max: 100,
        grid: { color: '#F1F5F9' },
        ticks: { font: { family: "'Plus Jakarta Sans', sans-serif" } }
      },
      y: {
        grid: { display: false },
        ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", weight: '500' } }
      }
    },
    plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0F172A',
          titleFont: { size: 13, family: "'Plus Jakarta Sans', sans-serif" },
          bodyFont: { size: 13, family: "'Plus Jakarta Sans', sans-serif" },
          padding: 12,
          cornerRadius: 8,
        }
    }
  };

  return (
    <div className="chart-container" style={{ height: '480px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Análisis Detallado por Sector y Personal
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="sector-select" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>Sector:</label>
          <select 
            id="sector-select"
            value={sectorSeleccionado} 
            onChange={(e) => setSectorSeleccionado(e.target.value)}
            style={{ 
              padding: '8px 12px', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)', 
              fontSize: '0.95rem',
              backgroundColor: 'white',
              color: 'var(--text-main)',
              fontWeight: '600',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {SECTORES.map(sec => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ height: '360px', position: 'relative' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            Cargando datos de {sectorSeleccionado}...
          </div>
        ) : chartData ? (
          <Bar options={options} data={chartData} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            No hay datos disponibles para este sector.
          </div>
        )}
      </div>
    </div>
  );
}

export default SectorDetailDashboard;
